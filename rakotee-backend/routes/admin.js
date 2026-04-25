
const express = require('express');
const router = express.Router();


const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminLoginLimiter } = require('../middleware/rateLimiter');

// PIN-based access (server-side)
// Expects { pin } in the body. The bcrypt hash of the PIN should be set in env ADMIN_PIN_HASH
router.post('/pin', adminLoginLimiter, async (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });
  try {
    const hash = process.env.ADMIN_PIN_HASH;
    if (!hash) return res.status(500).json({ error: 'Server not configured for PIN access' });
    const ok = await bcrypt.compare(pin, hash);
    if (!ok) return res.status(401).json({ error: 'Invalid PIN' });
    // issue a token like the normal admin login (role must be 'admin')
    const token = jwt.sign({ adminId: 'pin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '20m' });
    // Set HttpOnly cookie for admin session. server.js provides a res.cookie serializer function
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 20 * 60 * 1000 // 20 minutes
    };
    try {
      const serialized = res.cookie('admin_token', token, cookieOpts);
      // set header
      res.setHeader('Set-Cookie', serialized);
    } catch (err) {
      console.warn('Failed to set cookie via res.cookie helper, attempting manual serialization', err);
      const cookie = require('cookie');
      res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, cookieOpts));
    }
    // Also return token in JSON for compatibility (frontend will prefer cookie if present)
    res.json({ token, role: 'admin' });
  } catch (err) {
    console.error('PIN login error', err);
    res.status(500).json({ error: 'PIN login failed' });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials.' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    // Create JWT token
    const token = jwt.sign({ adminId: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    };
    try {
      const serialized = res.cookie('admin_token', token, cookieOpts);
      res.setHeader('Set-Cookie', serialized);
    } catch (err) {
      console.warn('Failed to set cookie via res.cookie helper, attempting manual serialization', err);
      const cookie = require('cookie');
      res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, cookieOpts));
    }
    res.json({ token, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Validate current admin session (cookie or bearer token)
router.get('/session', requireAdmin, async (req, res) => {
  try {
    return res.json({ ok: true, admin: req.admin || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Session check failed' });
  }
});

// Explicit logout endpoint to clear admin cookie server-side
router.post('/logout', (req, res) => {
  try {
    const cookie = require('cookie');
    const serialized = cookie.serialize('admin_token', '', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 0
    });
    res.setHeader('Set-Cookie', serialized);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Logout failed' });
  }
});


// --- Product Management ---
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Utility: validate that variant image paths exist on disk or are valid http(s) URLs
function validateVariantsObject(variants) {
  const fs = require('fs');
  const missing = [];
  if (!variants || typeof variants !== 'object') return { ok: true };
  const baseDir = path.join(__dirname, '..', '..'); // repo root
  for (const [color, imgs] of Object.entries(variants)) {
    if (!Array.isArray(imgs)) continue;
    for (const img of imgs) {
      if (!img || typeof img !== 'string') continue;
      const trimmed = img.trim();
      if (/^https?:\/\//i.test(trimmed)) continue; // external URL, accept
      // resolve relative to repo root
      const abs = path.join(baseDir, trimmed.replace(/^\//, ''));
      if (!fs.existsSync(abs)) {
        missing.push(trimmed);
      }
    }
  }
  return { ok: missing.length === 0, missing };
}

function normalizeImageRefs(productLike) {
  if (!productLike) return productLike;
  const item = typeof productLike.toObject === 'function' ? productLike.toObject() : { ...productLike };
  const fs = require('fs');
  const mapOne = (raw) => {
    const src = (raw || '').toString().trim();
    if (!src) return src;
    if (!src.startsWith('/products/') && !src.startsWith('products/')) return src;
    const filename = path.basename(src);
    const diskPath = path.join(__dirname, '..', '..', 'images', 'products', filename);
    if (fs.existsSync(diskPath)) return `/images/products/${filename}`;
    return src;
  };

  if (Array.isArray(item.images)) item.images = item.images.map(mapOne);
  if (item.image) item.image = mapOne(item.image);
  return item;
}

// multer setup: store uploads in memory (caller may move to disk/ S3 in production)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create product (accept multipart/form-data with files named 'images')
router.post('/products', requireAdmin, upload.array('images'), async (req, res) => {
  try {
    const body = req.body || {};
    // parse arrays/JSON fields when sent as strings
    const sizes = body.sizes ? JSON.parse(body.sizes) : (body.sizes || []);
    const colors = body.colors ? JSON.parse(body.colors) : (body.colors || []);
    const highlights = body.highlights ? JSON.parse(body.highlights) : (body.highlights || []);
    let variants = undefined;
    if (body.variants) {
      try { variants = JSON.parse(body.variants); } catch (e) { variants = body.variants; }
    }

    const images = [];
    // If files were uploaded, we need to persist them somewhere. For now, store them in ./images/products with a timestamped filename.
    if (req.files && req.files.length) {
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '..', '..', 'images', 'products');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      for (const file of req.files) {
        const ext = path.extname(file.originalname) || '.jpg';
        const fname = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
        const outPath = path.join(uploadDir, fname);
        fs.writeFileSync(outPath, file.buffer);
        // store relative path for frontend
        images.push(`/images/products/${fname}`);
      }
    }

  // fallback: if body.images provided as JSON string or array
    if ((!images.length) && body.images) {
      try {
        const parsed = JSON.parse(body.images);
        if (Array.isArray(parsed)) images.push(...parsed);
      } catch (e) {
        // if it's a single url string
        if (typeof body.images === 'string' && body.images.trim()) images.push(body.images.trim());
      }
    }

    // validate variants reference files
    if (variants) {
      const vres = validateVariantsObject(variants);
      if (!vres.ok) return res.status(400).json({ error: 'Variant validation failed', missing: vres.missing });
    }

    const prodData = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price) || 0,
      image: images[0] || body.image || '',
      images,
      sizes,
      colors,
      highlights,
      variants,
      category: body.category || ''
    };

    const product = new Product(prodData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error', err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// List products (pagination & search)
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    let products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    products = products.map(normalizeImageRefs);
    const total = await Product.countDocuments(query);
    res.json({ products, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update product (supports multipart/form-data with images appended)
router.put('/products/:id', requireAdmin, upload.array('images'), async (req, res) => {
  try {
    const body = req.body || {};
    const update = { ...body };
    // parse JSON string fields if present
    if (body.sizes && typeof body.sizes === 'string') {
      try { update.sizes = JSON.parse(body.sizes); } catch (e) { update.sizes = body.sizes.split(/,|\n/).map(s=>s.trim()).filter(Boolean); }
    }
    if (body.colors && typeof body.colors === 'string') {
      try { update.colors = JSON.parse(body.colors); } catch (e) { update.colors = body.colors.split(/,|\n/).map(s=>s.trim()).filter(Boolean); }
    }
    if (body.highlights && typeof body.highlights === 'string') {
      try { update.highlights = JSON.parse(body.highlights); } catch (e) { update.highlights = body.highlights.split(/,|\n/).map(s=>s.trim()).filter(Boolean); }
    }
    if (body.variants && typeof body.variants === 'string') {
      try { update.variants = JSON.parse(body.variants); } catch (e) { update.variants = body.variants; }
    }

    // handle uploaded files: save and append to images
    if (req.files && req.files.length) {
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '..', '..', 'images', 'products');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const newImgs = [];
      for (const file of req.files) {
        const ext = path.extname(file.originalname) || '.jpg';
        const fname = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
        const outPath = path.join(uploadDir, fname);
        fs.writeFileSync(outPath, file.buffer);
        newImgs.push(`/images/products/${fname}`);
      }
      // append new images to existing images array
      const existing = (await Product.findById(req.params.id)) || {};
      update.images = Array.isArray(existing.images) ? [...existing.images, ...newImgs] : [...newImgs];
      if (!update.image) update.image = update.images[0];
    }

    // validate variants if provided
    if (update.variants) {
      const vres = validateVariantsObject(update.variants);
      if (!vres.ok) return res.status(400).json({ error: 'Variant validation failed', missing: vres.missing });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...update, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
});

// Delete product
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// --- Order Management ---
const Order = require('../models/Order');

// List orders (pagination & search)
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const query = search ? { email: { $regex: search, $options: 'i' } } : {};
    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);
    res.json({ orders, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order
router.put('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order', details: err.message });
  }
});

// Delete order
router.delete('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});


// --- Customer Management ---
const User = require('../models/User');

// List customers (pagination & search)
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const query = search ? {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ],
      role: 'customer'
    } : { role: 'customer' };
    const customers = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ customers, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/customers/:id', requireAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update customer
router.put('/customers/:id', requireAdmin, async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!customer || customer.role !== 'customer') return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update customer', details: err.message });
  }
});

// Delete customer
router.delete('/customers/:id', requireAdmin, async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(req.params.id);
    if (!customer || customer.role !== 'customer') return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});


// --- Payment and Financial Oversight ---
// List payments/transactions
router.get('/payments', requireAdmin, async (req, res) => {
  try {
    // Assuming payments are tracked in orders
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const query = search ? { email: { $regex: search, $options: 'i' }, paid: true } : { paid: true };
    const payments = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);
    res.json({ payments, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Refund payment (mark order as refunded)
router.post('/payments/refund/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.paid) return res.status(404).json({ error: 'Paid order not found' });
    order.refunded = true;
    order.refundReason = req.body.reason || '';
    await order.save();
    res.json({ message: 'Order refunded', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refund payment' });
  }
});

// Financial reports (basic revenue summary)
router.get('/payments/summary', requireAdmin, async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { paid: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const refundedCount = await Order.countDocuments({ refunded: true });
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      refundedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});


// --- Marketing and Promotion ---
const Promotion = require('../models/Promotion');

// List promotions (pagination & search)
router.get('/promotions', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};
    const promotions = await Promotion.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Promotion.countDocuments(query);
    res.json({ promotions, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Create promotion
router.post('/promotions', requireAdmin, async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create promotion', details: err.message });
  }
});

// Update promotion
router.put('/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });
    res.json(promotion);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update promotion', details: err.message });
  }
});

// Delete promotion
router.delete('/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});


// --- Inventory Control ---
// View inventory (all products with stock info)
router.get('/inventory', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const lowStock = req.query.lowStock === 'true';
    const threshold = parseInt(req.query.threshold) || 5;
    const query = lowStock ? { stock: { $lte: threshold } } : {};
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ stock: 1 });
    const total = await Product.countDocuments(query);
    res.json({ products, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Update inventory item (stock)
router.put('/inventory/:id', requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    if (typeof stock !== 'number') return res.status(400).json({ error: 'Stock value required' });
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update inventory', details: err.message });
  }
});


// --- Analytics and Reporting ---
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    // Total users
    const userCount = await User.countDocuments();
    // Total products
    const productCount = await Product.countDocuments();
    // Total orders
    const orderCount = await Order.countDocuments();
    // Total revenue (paid orders)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paid: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    // Orders by month (last 12 months)
    const ordersByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      userCount,
      productCount,
      orderCount,
      totalRevenue,
      ordersByMonth
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});


// --- Security and Compliance ---
const AdminLog = require('../models/AdminLog');

// Access control middleware (simple demo)
function requireAdmin(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }
  // Check cookie header if present (cookie parsing minimal)
  if (!token && req.headers.cookie) {
    const cookie = require('cookie');
    const parsed = cookie.parse(req.headers.cookie || '');
    if (parsed && parsed.admin_token) token = parsed.admin_token;
  }
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// View security logs (admin actions)
router.get('/security/logs', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const logs = await AdminLog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await AdminLog.countDocuments();
    res.json({ logs, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
});

// Compliance checks (basic demo)
router.get('/security/compliance', requireAdmin, async (req, res) => {
  try {
    // Example: count admin users, check for missing emails
    const adminCount = await Admin.countDocuments();
    const missingEmailAdmins = await Admin.countDocuments({ email: { $exists: false } });
    res.json({
      adminCount,
      missingEmailAdmins,
      compliance: missingEmailAdmins === 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compliance info' });
  }
});

module.exports = router;
