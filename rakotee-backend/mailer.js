const nodemailer = require('nodemailer');

async function createTransporter() {
  // If explicit SMTP credentials are provided, use them
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const host = String(process.env.EMAIL_HOST).trim().toLowerCase();
    const secure = process.env.EMAIL_SECURE === 'true';
    const pass = String(process.env.EMAIL_PASS).replace(/\s+/g, '');
    const baseConfig = {
      secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.EMAIL_USER,
        pass
      }
    };

    if (host === 'smtp.gmail.com') {
      return nodemailer.createTransport({
        ...baseConfig,
        service: 'gmail'
      });
    }

    return nodemailer.createTransport({
      ...baseConfig,
      host,
      port: parseInt(process.env.EMAIL_PORT, 10) || (secure ? 465 : 587)
    });
  }

  // Otherwise create an Ethereal test account for local development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

function getMailConfigSummary() {
  const smtpConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
  return {
    mode: smtpConfigured ? 'smtp' : 'ethereal-fallback',
    host: process.env.EMAIL_HOST || 'not set',
    port: process.env.EMAIL_PORT || '587',
    secure: process.env.EMAIL_SECURE || 'false',
    user: process.env.EMAIL_USER || 'not set',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'not set'
  };
}

async function verifyMailTransport() {
  const transporter = await createTransporter();
  await transporter.verify();
  return true;
}

async function sendMail({ to, subject, text, html, from }) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: from || process.env.EMAIL_FROM || 'no-reply@rakotee.local',
    to,
    subject,
    text,
    html
  });
  // If using Ethereal, return preview URL for debugging
  const preview = nodemailer.getTestMessageUrl(info);
  return { info, preview };
}

module.exports = { sendMail, getMailConfigSummary, verifyMailTransport };
