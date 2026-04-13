const express = require('express');
const router = express.Router();
const { sendMail } = require('../mailer');

// Simple test endpoint to send an email using current SMTP env vars.
// Use carefully in production — it's intentionally minimal for admin testing.
router.post('/send-test-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to) return res.status(400).json({ message: 'Recipient (to) is required' });
    const mailPromise = sendMail({
      to,
      subject: subject || 'Test from RAKOTEE',
      html: html || '<p>Test email</p>'
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SMTP timeout while sending test email')), 15000);
    });
    const { info, preview } = await Promise.race([mailPromise, timeoutPromise]);
    res.json({ message: 'Email sent', info: info.messageId, preview });
  } catch (err) {
    console.error('Send test email error:', err);
    res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
});

module.exports = router;
