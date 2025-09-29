const nodemailer = require('nodemailer');

async function createTransporter() {
  // If explicit SMTP credentials are provided, use them
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Otherwise create an Ethereal test account for local development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
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

module.exports = { sendMail };
