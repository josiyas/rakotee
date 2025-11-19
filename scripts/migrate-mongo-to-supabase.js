const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateData() {
  const mongoClient = new MongoClient(process.env.MONGO_URI);

  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db();

    // Migrate Users
    console.log('Migrating users...');
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      // Create auth user in Supabase
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'TemporaryPass123!', // Users will need to reset their passwords
        email_confirm: true
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authUser.id,
        username: user.username,
        full_name: user.name,
        phone: user.phone,
        address: user.address,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      }
    }

    // Migrate Products
    console.log('Migrating products...');
    const products = await db.collection('products').find({}).toArray();
    for (const product of products) {
      const { error } = await supabase.from('products').insert({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        category: product.category,
        tags: product.tags,
        is_active: product.isActive,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      });

      if (error) {
        console.error(`Error migrating product ${product.name}:`, error);
      }
    }

    // Migrate Orders
    console.log('Migrating orders...');
    const orders = await db.collection('orders').find({}).toArray();
    for (const order of orders) {
      // Get Supabase user ID for the order
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', order.userEmail)
        .single();

      if (!userData) {
        console.error(`User not found for order ${order._id}`);
        continue;
      }

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        user_id: userData.id,
        status: order.status,
        total_amount: order.totalAmount,
        shipping_address: order.shippingAddress,
        contact_email: order.contactEmail,
        contact_phone: order.contactPhone,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        payment_id: order.paymentId,
        created_at: order.createdAt,
        updated_at: order.updatedAt
      }).select().single();

      if (orderError) {
        console.error(`Error migrating order ${order._id}:`, orderError);
        continue;
      }

      // Migrate order items
      for (const item of order.items) {
        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_id: item.productId, // Make sure this matches the new Supabase product ID
          quantity: item.quantity,
          price_at_time: item.price
        });

        if (itemError) {
          console.error(`Error migrating order item:`, itemError);
        }
      }
    }

    // Migrate Admins
    console.log('Migrating admins...');
    const admins = await db.collection('admins').find({}).toArray();
    for (const admin of admins) {
      // Create auth user for admin
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: 'AdminTemp123!', // Admins will need to reset their passwords
        email_confirm: true
      });

      if (authError) {
        console.error(`Error creating auth user for admin ${admin.email}:`, authError);
        continue;
      }

      // Add admin role
      const { error: roleError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { role: 'admin' }
      );

      if (roleError) {
        console.error(`Error setting admin role for ${admin.email}:`, roleError);
      }

      // Create admin record
      const { error: adminError } = await supabase.from('admins').insert({
        id: authUser.id,
        role: admin.role,
        is_super_admin: admin.isSuperAdmin,
        last_login: admin.lastLogin,
        created_at: admin.createdAt,
        updated_at: admin.updatedAt
      });

      if (adminError) {
        console.error(`Error creating admin record for ${admin.email}:`, adminError);
      }
    }

    // Migrate Promotions
    console.log('Migrating promotions...');
    const promotions = await db.collection('promotions').find({}).toArray();
    for (const promo of promotions) {
      const { error } = await supabase.from('promotions').insert({
        code: promo.code,
        description: promo.description,
        discount_type: promo.discountType,
        discount_value: promo.discountValue,
        min_purchase: promo.minPurchase,
        max_discount: promo.maxDiscount,
        start_date: promo.startDate,
        end_date: promo.endDate,
        usage_limit: promo.usageLimit,
        usage_count: promo.usageCount,
        is_active: promo.isActive,
        created_at: promo.createdAt,
        updated_at: promo.updatedAt
      });

      if (error) {
        console.error(`Error migrating promotion ${promo.code}:`, error);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoClient.close();
  }
}

migrateData();