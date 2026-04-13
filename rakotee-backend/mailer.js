const nodemailer = require('nodemailer');
const axios = require('axios');

function getMailProvider() {
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) return 'smtp';
  return 'ethereal-fallback';
}

function parseFromAddress(fromValue) {
  const raw = String(fromValue || '').trim();
  const match = raw.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ''),
      email: match[2].trim()
    };
  }
  return { name: '', email: raw };
}

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
  const provider = getMailProvider();
  return {
    mode: provider,
    host: process.env.EMAIL_HOST || 'not set',
    port: process.env.EMAIL_PORT || '587',
    secure: process.env.EMAIL_SECURE || 'false',
    user: process.env.EMAIL_USER || 'not set',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'not set'
  };
}

async function verifyMailTransport() {
  if (getMailProvider() === 'brevo') {
    await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        Accept: 'application/json'
      },
      timeout: 12000
    });
    return true;
  }

  const transporter = await createTransporter();
  await transporter.verify();
  return true;
}

async function sendMail({ to, subject, text, html, from }) {
  if (getMailProvider() === 'brevo') {
    const sender = parseFromAddress(from || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@rakotee.local');
    const recipients = String(to)
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
      .map((email) => ({ email }));

    let response;
    try {
      response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender,
          to: recipients,
          subject,
          textContent: text,
          htmlContent: html
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 15000
        }
      );
    } catch (err) {
      const providerDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      const wrapped = new Error(`Brevo send failed: ${providerDetail}`);
      wrapped.cause = err;
      throw wrapped;
    }

    return {
      info: {
        messageId: response.data?.messageId || null,
        accepted: recipients.map((recipient) => recipient.email),
        rejected: [],
        response: 'brevo accepted'
      },
      preview: null
    };
  }

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
