const express = require('express');
const router = express.Router();
const { sendMail, getMailConfigSummary, verifyMailTransport } = require('../mailer');

router.get('/email-status', async (req, res) => {
  try {
    const config = getMailConfigSummary();
    try {
      await Promise.race([
        verifyMailTransport(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP verify timeout')), 12000))
      ]);
      res.json({ ok: true, config, verify: 'success' });
    } catch (err) {
      res.status(500).json({ ok: false, config, verify: 'failed', error: err.message });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

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
    res.json({
      message: 'Email sent',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      preview
    });
  } catch (err) {
    console.error('Send test email error:', err);
    const providerError = err.cause?.response?.data || null;
    res.status(500).json({
      message: 'Failed to send test email',
      error: err.message,
      providerError
    });
  }
});

module.exports = router;
