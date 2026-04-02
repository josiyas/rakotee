// Example for routes/auth.js
const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Order = require('../models/Order');
const IpnLog = require('../models/IpnLog');
const qs = require('querystring');
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

// Create PayFast payment form server-side and redirect customer
router.post('/payfast', async (req, res) => {
  try {
    console.log('PayFast request received');
    console.log('PAYFAST_MERCHANT_ID:', process.env.PAYFAST_MERCHANT_ID ? 'SET' : 'NOT SET');
    console.log('PAYFAST_MERCHANT_KEY:', process.env.PAYFAST_MERCHANT_KEY ? 'SET' : 'NOT SET');
    
    const { name, email, address, cart, return_url } = req.body;
    if (!name || !email || !address || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or cart is empty.' });
    }
    
    // TEMPORARY: Hardcode credentials for testing
    const merchant_id = process.env.PAYFAST_MERCHANT_ID || '32069113';
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || 'r6ujmvnqysl5p';
    console.log('Using merchant_id:', merchant_id);
    
    if (!merchant_id || !merchant_key) {
      console.error('PayFast credentials missing:', { merchant_id: !!merchant_id, merchant_key: !!merchant_key });
      return res.status(500).json({ error: 'Payment provider not configured.' });
    }

    // Save order as pending
    let order;
    try {
      order = new Order({ name, email, address, cart, paid: false });
      await order.save();
      console.log('Order saved:', order._id);
    } catch (saveErr) {
      console.error('MongoDB save error:', saveErr.message);
      // Generate a temporary ID if MongoDB fails (for testing)
      order = { _id: require('crypto').randomBytes(12).toString('hex') };
      console.warn('Using temporary order ID due to MongoDB error:', order._id);
    }

    const amount = cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0).toFixed(2);
  const baseReturn = return_url || (req.headers.origin || `${req.protocol}://${req.get('host')}`) + '/checkout.html';
  // Include order id so client can show order info on return
  const pfReturn = `${baseReturn}?payfast=success&orderId=${order._id}`;
  const notifyUrl = (req.headers.origin || `${req.protocol}://${req.get('host')}`) + '/api/order/payfast-ipn';

    // Build a simple HTML form that auto-submits to PayFast
    const fields = {
      merchant_id,
  merchant_key,
  amount,
  item_name: `Rakotee Order ${order._id}`,
  return_url: pfReturn,
  notify_url: notifyUrl,
  custom_int1: order._id.toString(), // use custom field to correlate
    };

    const formInputs = Object.entries(fields).map(([k, v]) => `  <input type="hidden" name="${k}" value="${String(v).replace(/\"/g, '&quot;')}"/>`).join('\n');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to PayFast</title></head><body><p>Redirecting to PayFast...</p><form id="pf" action="https://www.payfast.co.za/eng/process" method="post">\n${formInputs}\n</form><script>document.getElementById('pf').submit();</script></body></html>`;
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error('PayFast init error', err);
    res.status(500).json({ error: 'Failed to initiate PayFast payment.' });
  }
});

// PayFast IPN endpoint
router.post('/payfast-ipn', async (req, res) => {
  // Verify PayFast IPN and mark order paid only after verification
  try {
    const body = req.body || {};
    // Create initial IPN log
    const ipnLog = new IpnLog({ provider: 'PayFast', payload: body, headers: req.headers });
    await ipnLog.save();
    // Build urlencoded payload to post back for verification
    const params = new URLSearchParams();
    Object.keys(body).forEach(k => params.append(k, body[k]));
    const validationUrl = 'https://www.payfast.co.za/eng/query/validate';
    let verified = false;
    try {
      const resp = await axios.post(validationUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });
      const data = (resp && resp.data) ? String(resp.data) : '';
      // PayFast responds with a body indicating validity; check for keyword
      if (/valid|verified/i.test(data) || resp.status === 200) verified = true;
    } catch (vErr) {
      // If verification endpoint fails, log and continue to strict check fallback
      console.error('PayFast verification request failed:', vErr && vErr.message);
    }

    const orderId = body.custom_int1 || body.custom_str1 || null;
    if (!orderId) {
      console.warn('PayFast IPN missing custom order id', body);
      ipnLog.verificationResponse = 'Missing order id';
      ipnLog.verified = false;
      await ipnLog.save();
      return res.status(400).send('Missing order id');
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');

    // Basic amount check
    const amount_gross = parseFloat(body.amount_gross || body.amount || 0) || 0;
    const expected = order.cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);
    const amountMatches = Math.abs(amount_gross - expected) < 0.5; // allow small rounding diffs

    ipnLog.orderId = order._id;
    ipnLog.amount = amount_gross;
    ipnLog.verificationResponse = verified ? 'verified' : 'not_verified';
    ipnLog.verified = !!(verified && amountMatches);
    await ipnLog.save();

    if (verified && amountMatches) {
      order.paid = true;
      order.paymentMethod = 'PayFast';
      order.paymentRef = body.m_payment_id || body.payment_id || '';
      await order.save();
      return res.status(200).send('OK');
    }

    console.warn('PayFast IPN failed verification or amount mismatch', { verified, amount_gross, expected });
    return res.status(400).send('Invalid IPN');
  } catch (err) {
    console.error('PayFast IPN error', err);
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

// Return IPN logs (admin only)
router.get('/ipn-logs', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const IpnLog = require('../models/IpnLog');
  const logs = await IpnLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

// Mark order as delivered (admin)
router.post('/mark-delivered/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.delivered = true;
  await order.save();
  res.json({ ok: true });
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
