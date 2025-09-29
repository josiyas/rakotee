// Example for routes/auth.js
const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Order = require('../models/Order');
const axios = require('axios');

// Security middleware
router.use(helmet());
router.use(cors());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Place order endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, address, cart } = req.body;
    if (!name || !email || !address || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or cart is empty.' });
    }
    const order = new Order({ name, email, address, cart });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// PayFast IPN endpoint
router.post('/payfast-ipn', async (req, res) => {
  // For demo: mark order as paid if IPN received
  try {
    const { email, amount_gross } = req.body;
    const order = await Order.findOne({ email, paid: { $ne: true } });
    if (order) {
      order.paid = true;
      order.paymentMethod = 'PayFast';
      await order.save();
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

// PayPal IPN endpoint
router.post('/paypal-ipn', async (req, res) => {
  // For demo: mark order as paid if IPN received
  try {
    const { payer_email, mc_gross } = req.body;
    const order = await Order.findOne({ email: payer_email, paid: { $ne: true } });
    if (order) {
      order.paid = true;
      order.paymentMethod = 'PayPal';
      await order.save();
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Yoco webhook endpoint
router.post('/yoco-webhook', async (req, res) => {
  // For demo: mark order as paid if webhook received
  try {
    const { email, amount } = req.body;
    const order = await Order.findOne({ email, paid: { $ne: true } });
    if (order) {
      order.paid = true;
      order.paymentMethod = 'Yoco';
      await order.save();
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Peach Payments webhook endpoint
router.post('/peach-webhook', async (req, res) => {
  // For demo: mark order as paid if webhook received
  try {
    const { email, amount } = req.body;
    const order = await Order.findOne({ email, paid: { $ne: true } });
    if (order) {
      order.paid = true;
      order.paymentMethod = 'Peach Payments';
      await order.save();
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Protect admin order routes with a simple admin password (for demo)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2006Josiyas21!';

function isAdmin(req) {
  // Check for admin password in header (for demo, use a better system in production)
  return req.headers['x-admin-password'] === ADMIN_PASSWORD;
}

router.get('/all', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/deliver/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.delivered = true;
  await order.save();
  res.json({ message: 'Order marked as delivered.' });
});

// Dummy route
router.get('/', (req, res) => {
  res.send('Order route working');
});

module.exports = router;
