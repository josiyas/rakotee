
const express = require('express');
const router = express.Router();


const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    res.json({ token, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});


// --- Product Management ---
const Product = require('../models/Product');

// Create product
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
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
    const total = await Product.countDocuments(query);
    // If no products exist, create a demo product for admin visibility
    if (total === 0) {
      const demoProduct = new Product({
        name: 'Demo Product',
        description: 'This is a demo product for admin testing.',
        price: 99.99,
        image: 'https://via.placeholder.com/150',
        stock: 10,
        category: 'Demo'
      });
      await demoProduct.save();
      products = [demoProduct];
    }
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

// Update product
router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
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
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.replace('Bearer ', '');
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
