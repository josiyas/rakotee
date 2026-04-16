// Example for routes/auth.js
const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Order = require('../models/Order');
const IpnLog = require('../models/IpnLog');
const { sendMail } = require('../mailer');
const axios = require('axios');
const crypto = require('crypto');
const net = require('net');

function buildOrderEmailTemplate({ customerName, orderId, itemsHtml, total, address }) {
  const currentYear = new Date().getFullYear();
  return `
    <div style="margin:0;padding:24px;background:#f5f7fb;font-family:Segoe UI,Arial,sans-serif;color:#111;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7ebf3;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;color:#fff;padding:20px 24px;">
          <div style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:0.8;">RAKOTEE</div>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">Order Confirmed</h1>
        </div>
        <div style="padding:24px;line-height:1.65;color:#1f2937;font-size:15px;">
          <p style="margin-top:0;">Hi ${customerName}, your payment was successful and your order is now being processed.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <h3 style="margin-bottom:10px;">Order summary</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin:10px 0;"><strong>Total:</strong> R${total}</p>
          <p style="margin:10px 0;"><strong>Delivery address:</strong> ${address}</p>
          <p style="margin-top:20px;">We will email you again when your order ships.</p>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #eef2f7;background:#fafcff;color:#64748b;font-size:12px;">
          © ${currentYear} RAKOTEE. All rights reserved.
        </div>
      </div>
    </div>
  `;
}

function getBaseUrl(req) {
  return process.env.SERVER_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
}

function getFrontendUrl(req) {
  return process.env.CLIENT_URL || req.headers.origin || getBaseUrl(req);
}

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/+$/, '');
}

function buildPayfastSignature(fields, passphrase) {
  const cleaned = Object.entries(fields).filter(([, value]) => value !== undefined && value !== null && String(value) !== '');
  const payload = cleaned
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, '+')}`)
    .join('&');

  const finalPayload = passphrase
    ? `${payload}&passphrase=${encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+')}`
    : payload;

  return crypto.createHash('md5').update(finalPayload).digest('hex');
}

const PAYFAST_ALLOWED_IP_RULES = [
  { subnet: '197.97.145.144', prefix: 28 },
  { subnet: '41.74.179.192', prefix: 27 },
  { subnet: '102.216.36.0', prefix: 28 },
  { subnet: '102.216.36.128', prefix: 28 },
  { single: '144.126.193.139' },
  // PayFast AWS migration IPs (payment/api domains)
  { single: '3.163.232.237' },
  { single: '3.163.233.237' },
  { single: '3.163.234.237' },
  { single: '3.163.235.237' },
  { single: '3.163.236.237' },
  { single: '3.163.237.237' },
  { single: '3.163.238.237' },
  { single: '3.163.239.237' },
  { single: '3.163.240.237' },
  { single: '3.163.241.237' },
  { single: '3.163.242.237' },
  { single: '3.163.243.237' },
  { single: '3.163.244.237' },
  { single: '3.163.245.237' },
  { single: '3.163.246.237' },
  { single: '3.163.247.237' },
  { single: '3.163.248.237' },
  { single: '3.163.249.237' },
  { single: '3.163.250.237' },
  { single: '3.163.251.237' },
  { single: '3.163.252.237' }
];

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = String(forwarded).split(',')[0].trim();
    return first;
  }
  const raw = req.socket?.remoteAddress || req.ip || '';
  return String(raw).replace('::ffff:', '');
}

function isIpAllowedByPayfast(ip) {
  if (!ip || net.isIP(ip) !== 4) return false;
  const bl = new net.BlockList();
  for (const rule of PAYFAST_ALLOWED_IP_RULES) {
    if (rule.single) {
      bl.addAddress(rule.single, 'ipv4');
    } else {
      bl.addSubnet(rule.subnet, rule.prefix, 'ipv4');
    }
  }
  return bl.check(ip, 'ipv4');
}

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

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const payfast_mode = (process.env.PAYFAST_MODE || 'sandbox').toLowerCase();
    const payfastProcessUrl = payfast_mode === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    if (!merchant_id || !merchant_key) {
      console.error('PayFast credentials are missing in environment variables.');
      return res.status(500).json({ error: 'Payment provider not configured. Please check environment variables.' });
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
    const frontendBase = normalizeBaseUrl(return_url || getFrontendUrl(req));
    const backendBase = normalizeBaseUrl(getBaseUrl(req));
    const pfReturn = `${frontendBase}/checkout.html?payfast=success&orderId=${order._id}`;
    const pfCancel = `${frontendBase}/checkout.html?payfast=cancelled&orderId=${order._id}`;
    const notifyUrl = `${backendBase}/api/order/payfast-ipn`;

    // Build a simple HTML form that auto-submits to PayFast
    const fields = {
      merchant_id,
      merchant_key,
      return_url: pfReturn,
      cancel_url: pfCancel,
      notify_url: notifyUrl,
      name_first: String(name).split(' ')[0],
      email_address: email,
      m_payment_id: order._id.toString(),
      amount,
      item_name: `Rakotee Order ${order._id}`,
      custom_str1: order._id.toString()
    };
    fields.signature = buildPayfastSignature(fields, passphrase);

    const formInputs = Object.entries(fields).map(([k, v]) => `  <input type="hidden" name="${k}" value="${String(v).replace(/\"/g, '&quot;')}"/>`).join('\n');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to PayFast</title></head><body><p>Redirecting to PayFast...</p><form id="pf" action="${payfastProcessUrl}" method="post">\n${formInputs}\n</form><script>document.getElementById('pf').submit();</script></body></html>`;
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
    const sourceIp = getClientIp(req);
    const enforceIpCheck = String(process.env.PAYFAST_ENFORCE_IP_CHECK || 'false').toLowerCase() === 'true';

    if (enforceIpCheck && !isIpAllowedByPayfast(sourceIp)) {
      console.warn('Rejected PayFast IPN from non-whitelisted IP', { sourceIp });
      const rejectedLog = new IpnLog({
        provider: 'PayFast',
        payload: body,
        headers: req.headers,
        verified: false,
        verificationResponse: `Rejected source IP: ${sourceIp || 'unknown'}`
      });
      await rejectedLog.save();
      return res.status(403).send('Forbidden');
    }

    // Create initial IPN log
    const ipnLog = new IpnLog({ provider: 'PayFast', payload: body, headers: req.headers });
    await ipnLog.save();
    // Build urlencoded payload to post back for verification
    const params = new URLSearchParams();
    Object.keys(body).forEach(k => params.append(k, body[k]));
    const payfast_mode = (process.env.PAYFAST_MODE || 'sandbox').toLowerCase();
    const validationUrl = payfast_mode === 'live'
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate';
    let verified = false;
    let verificationResponse = '';
    try {
      const resp = await axios.post(validationUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });
      verificationResponse = (resp && resp.data) ? String(resp.data).trim() : '';
      verified = verificationResponse.toUpperCase() === 'VALID';
    } catch (vErr) {
      // If verification endpoint fails, log and continue to strict check fallback
      console.error('PayFast verification request failed:', vErr && vErr.message);
      verificationResponse = vErr && vErr.message ? String(vErr.message) : 'verification_request_failed';
    }

    const orderId = body.m_payment_id || body.custom_int1 || body.custom_str1 || null;
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
    ipnLog.verificationResponse = verificationResponse || (verified ? 'VALID' : 'INVALID');
    const paymentStatus = String(body.payment_status || '').toUpperCase();
    const paymentComplete = paymentStatus === 'COMPLETE';
    ipnLog.verified = !!(verified && amountMatches && paymentComplete);
    await ipnLog.save();

    if (verified && amountMatches && paymentComplete) {
      order.paid = true;
      order.status = 'paid';
      order.paymentMethod = 'PayFast';
      order.paymentRef = body.m_payment_id || body.payment_id || '';
      await order.save();

      // Send order confirmation email to customer
      try {
        const itemsList = order.cart.map(i =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #edf2f7;">${i.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf2f7;text-align:center;">x${i.quantity || 1}</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf2f7;text-align:right;">R${(Number(i.price) * (i.quantity || 1)).toFixed(2)}</td>
          </tr>`
        ).join('');
        const total = order.cart.reduce((s, i) => s + (Number(i.price) * (i.quantity || 1)), 0).toFixed(2);
        const emailHtml = buildOrderEmailTemplate({
          customerName: order.name,
          orderId: order._id,
          itemsHtml: itemsList,
          total,
          address: order.address
        });
        await sendMail({
          to: order.email,
          subject: 'RAKOTEE Order Confirmation',
          html: emailHtml,
          text: `Order confirmed. Order ID: ${order._id}. Total: R${total}. Delivery address: ${order.address}`
        });
      } catch (emailErr) {
        console.error('Order confirmation email failed:', emailErr.message);
      }

      return res.status(200).send('OK');
    }

    console.warn('PayFast IPN failed checks', { verified, paymentStatus, amount_gross, expected });
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
