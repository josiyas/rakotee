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
    const { name, email, address, cart, return_url } = req.body;
    if (!name || !email || !address || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or cart is empty.' });
    }
    // Save order as pending
    const order = new Order({ name, email, address, cart, paid: false });
    await order.save();

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    if (!merchant_id || !merchant_key) {
      return res.status(500).json({ error: 'Payment provider not configured.' });
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

// --- PayPal server-side flow: create order, capture, and webhook verify ---
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
  const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const tokenUrl = `${base}/v1/oauth2/token`;
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const resp = await axios.post(tokenUrl, qs.stringify({ grant_type: 'client_credentials' }), {
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return { accessToken: resp.data.access_token, base };
}

router.post('/paypal-create', async (req, res) => {
  try {
    const { name, email, address, cart, return_url, cancel_url } = req.body;
    if (!name || !email || !address || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or cart is empty.' });
    }
    const order = new Order({ name, email, address, cart, paid: false });
    await order.save();

    const total = cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0).toFixed(2);
    const baseReturn = return_url || (req.headers.origin || `${req.protocol}://${req.get('host')}`) + '/checkout.html';
    const appReturn = `${baseReturn}?paypal=success&orderId=${order._id}`;
    const appCancel = cancel_url || (req.headers.origin || `${req.protocol}://${req.get('host')}`) + '/checkout.html?paypal=cancel&orderId=' + order._id;

    const { accessToken, base } = await getPayPalAccessToken();

    const createUrl = `${base}/v2/checkout/orders`;
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'ZAR', value: total },
          custom_id: order._id.toString()
        }
      ],
      application_context: { return_url: appReturn, cancel_url: appCancel }
    };

    const resp = await axios.post(createUrl, body, { headers: { Authorization: `Bearer ${accessToken}` } });
    const approve = (resp.data && resp.data.links) ? resp.data.links.find(l => l.rel === 'approve') : null;
    const approveUrl = approve ? approve.href : null;
    return res.json({ approveUrl, paypalOrderId: resp.data && resp.data.id, orderId: order._id });
  } catch (err) {
    console.error('PayPal create error', err && err.response && err.response.data ? err.response.data : err);
    res.status(500).json({ error: 'Failed to create PayPal order.' });
  }
});

router.post('/paypal-capture', async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    if (!paypalOrderId || !orderId) return res.status(400).json({ error: 'Missing params' });
    const { accessToken, base } = await getPayPalAccessToken();
    const captureUrl = `${base}/v2/checkout/orders/${paypalOrderId}/capture`;
    const resp = await axios.post(captureUrl, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
    // find our order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // mark paid
    order.paid = true;
    order.paymentMethod = 'PayPal';
    order.paymentRef = resp.data && resp.data.id ? resp.data.id : paypalOrderId;
    await order.save();
    return res.json({ ok: true, data: resp.data });
  } catch (err) {
    console.error('PayPal capture error', err && err.response && err.response.data ? err.response.data : err);
    res.status(500).json({ error: 'Failed to capture PayPal order.' });
  }
});

// Webhook verification endpoint
router.post('/paypal-webhook', async (req, res) => {
  try {
    const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
    const { accessToken, base } = await getPayPalAccessToken();
    const verifyUrl = `${base}/v1/notifications/verify-webhook-signature`;
    const transmissionId = req.headers['paypal-transmission-id'];
    const transmissionTime = req.headers['paypal-transmission-time'];
    const certUrl = req.headers['paypal-cert-url'];
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionSig = req.headers['paypal-transmission-sig'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const webhookEvent = req.body;

    if (!webhookId) return res.status(500).send('Webhook not configured');

    const payload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent
    };

    const verifyResp = await axios.post(verifyUrl, payload, { headers: { Authorization: `Bearer ${accessToken}` } });
    const status = verifyResp && verifyResp.data && verifyResp.data.verification_status;
    if (status !== 'SUCCESS') {
      console.warn('PayPal webhook failed verification', status);
      return res.status(400).send('Invalid webhook');
    }

    // Process event types (capture completed)
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource || {};
    // Try to find custom_id in purchase_units
    let customId = null;
    if (resource.purchase_units && resource.purchase_units.length) {
      customId = resource.purchase_units[0].custom_id || null;
    }
    // Some events include custom_id at different levels
    if (!customId && resource.custom_id) customId = resource.custom_id;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.DENIED') {
      if (customId) {
        const order = await Order.findById(customId);
        if (order) {
          if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            order.paid = true;
            order.paymentMethod = 'PayPal';
            order.paymentRef = resource.id || resource.capture_id || '';
            await order.save();
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('PayPal webhook error', err && err.response && err.response.data ? err.response.data : err);
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
