const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

module.exports = sendEmail;
