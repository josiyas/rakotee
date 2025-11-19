/*
  Helper script to migrate basic collections (admins, users, products, orders) from MongoDB to Postgres.
  This is a convenience script — inspect and run carefully.
  Usage: node scripts/migrate-mongo-to-pg.js
  Requires: set env vars MONGO_URI and PG_CONNECTION (postgres connection string)
*/
const { MongoClient } = require('mongodb');
const { Client } = require('pg');

async function main() {
  const mongoUri = process.env.MONGO_URI;
  const pgConn = process.env.PG_CONNECTION;
  if (!mongoUri || !pgConn) {
    console.error('Set MONGO_URI and PG_CONNECTION environment variables');
    process.exit(1);
  }

  const m = new MongoClient(mongoUri);
  await m.connect();
  const db = m.db();
  const pg = new Client({ connectionString: pgConn });
  await pg.connect();

  // Example: migrate admins
  const admins = await db.collection('admins').find().toArray();
  for (const a of admins) {
    await pg.query(
      `insert into admins(id, email, password_hash, role, created_at, updated_at) values($1,$2,$3,$4,$5,$6) on conflict (email) do nothing`,
      [a._id.toString(), a.email, a.password, a.role || 'admin', a.createdAt || new Date(), a.createdAt || new Date()]
    );
  }

  // Users
  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    await pg.query(`insert into users(id, email, password_hash, username, role, email_verified, metadata, created_at, updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (email) do nothing`, [
      u._id.toString(), u.email, u.password || null, u.username || null, u.role || 'user', !!u.emailVerified, JSON.stringify(u.metadata || {}), u.createdAt || new Date(), u.updatedAt || new Date()
    ]);
  }

  // Products (simple mapping)
  const products = await db.collection('products').find().toArray();
  for (const p of products) {
    await pg.query(`insert into products(id, name, slug, sku, description, price, currency, stock, is_active, category, metadata, created_at, updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (slug) do nothing`, [
      p._id.toString(), p.name, p.slug || p._id.toString(), p.sku || null, p.description || null, p.price || 0, p.currency || 'USD', p.stock || 0, p.isActive !== false, p.category || null, JSON.stringify(p.metadata || {}), p.createdAt || new Date(), p.updatedAt || new Date()
    ]);
  }

  // Orders: map simple fields and insert order_items
  const orders = await db.collection('orders').find().toArray();
  for (const o of orders) {
    await pg.query(`insert into orders(id, user_id, status, shipping_address, billing_address, payment_info, total, currency, metadata, created_at, updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do nothing`, [
      o._id.toString(), o.userId ? o.userId.toString() : null, o.status || 'pending', JSON.stringify(o.shippingAddress || {}), JSON.stringify(o.billingAddress || {}), JSON.stringify(o.paymentInfo || {}), o.total || 0, o.currency || 'USD', JSON.stringify(o.metadata || {}), o.createdAt || new Date(), o.updatedAt || new Date()
    ]);
    if (Array.isArray(o.products)) {
      for (const item of o.products) {
        await pg.query(`insert into order_items(id, order_id, product_id, product_name, sku, quantity, unit_price, metadata) values(gen_random_uuid(),$1,$2,$3,$4,$5,$6)`, [
          o._id.toString(), item.product ? item.product.toString() : null, item.name || item.productName || null, item.sku || null, item.quantity || 1, item.price || 0, JSON.stringify(item.metadata || {})
        ]).catch(e => console.error('order_item insert error', e));
      }
    }
  }

  await pg.end();
  await m.close();
  console.log('Migration complete');
}

main().catch(err => { console.error(err); process.exit(1) });
