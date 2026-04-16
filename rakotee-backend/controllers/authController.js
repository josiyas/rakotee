const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../mailer');

// Password policy enforcement utility
function validatePassword(password) {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH) || 8;
  const requireSpecial = process.env.PASSWORD_REQUIRE_SPECIAL === 'true';
  if (password.length < minLength) return false;
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

function buildEmailTemplate({ title, intro, bodyHtml, ctaLabel, ctaUrl, footerNote }) {
  const currentYear = new Date().getFullYear();
  const ctaBlock = ctaLabel && ctaUrl
    ? `<p style="margin: 24px 0;"><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">${ctaLabel}</a></p>`
    : '';

  const html = `
    <div style="margin:0;padding:24px;background:#f5f7fb;font-family:Segoe UI,Arial,sans-serif;color:#111;">
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e7ebf3;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;color:#fff;padding:20px 24px;">
          <div style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:0.8;">RAKOTEE</div>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">${title}</h1>
        </div>
        <div style="padding:24px;line-height:1.65;color:#1f2937;font-size:15px;">
          <p style="margin-top:0;">${intro}</p>
          ${bodyHtml || ''}
          ${ctaBlock}
          <p style="margin:24px 0 0;">${footerNote || 'Need help? Reply to this email and the RAKOTEE team will assist you.'}</p>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #eef2f7;background:#fafcff;color:#64748b;font-size:12px;">
          © ${currentYear} RAKOTEE. All rights reserved.
        </div>
      </div>
    </div>
  `;

  return html;
}

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already exists.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ username, email, password: hashedPassword, emailVerificationToken });
    await user.save();
    const clientUrl = process.env.CLIENT_URL || 'https://rakotee.site';
    const verifyUrl = `${clientUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}`;
    let emailDelivered = true;
    try {
      const emailHtml = buildEmailTemplate({
        title: 'Welcome to RAKOTEE',
        intro: `Hi ${username}, your account is almost ready.`,
        bodyHtml: '<p>Confirm your email to activate your account and start shopping the latest drops.</p>',
        ctaLabel: 'Verify email address',
        ctaUrl: verifyUrl,
        footerNote: 'If you did not create this account, you can safely ignore this message.'
      });
      const { preview } = await sendMail({
        to: email,
        subject: 'Action needed: verify your RAKOTEE account',
        html: emailHtml,
        text: `Welcome to RAKOTEE. Verify your account to get started: ${verifyUrl}`
      });
      if (preview) console.log('Ethereal preview URL (registration):', preview);
    } catch (mailErr) {
      emailDelivered = false;
      console.error('Registration verification email failed:', mailErr.message);
    }

    res.status(201).json({
      message: emailDelivered
        ? 'User registered. Please check your email to verify your account.'
        : 'User registered, but email delivery is unavailable right now. Continue with the verification link below.',
      verificationUrl: emailDelivered ? undefined : verifyUrl
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    const user = await User.findOne({ email, emailVerificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  // send confirmation email
  const verifiedHtml = buildEmailTemplate({
    title: 'You are verified',
    intro: `Hi ${user.username || 'there'}, your email is now confirmed.`,
    bodyHtml: '<p>Your RAKOTEE account is fully active and ready for checkout, orders, and updates.</p>',
    ctaLabel: 'Sign in now',
    ctaUrl: `${process.env.CLIENT_URL || 'https://rakotee.site'}/login.html`,
    footerNote: 'Welcome in. Keep movin\'.'
  });
  const { preview } = await sendMail({
    to: user.email,
    subject: 'RAKOTEE account verified',
    html: verifiedHtml,
    text: 'Your RAKOTEE account is verified. You can now sign in.'
  });
  if (preview) console.log('Ethereal preview URL (verify):', preview);
  res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, email: user.email, username: user.username });
  } catch (err) {
    console.error('Login error:', err); // Log error details for debugging
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const clientUrl = process.env.CLIENT_URL || 'https://rakotee.site';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Do not block the API response indefinitely on SMTP provider latency.
    let emailDelivered = true;
    try {
      const resetHtml = buildEmailTemplate({
        title: 'Password reset request',
        intro: 'We received a request to reset your RAKOTEE password.',
        bodyHtml: '<p>For your security, this reset link expires in 1 hour.</p>',
        ctaLabel: 'Reset password',
        ctaUrl: resetUrl,
        footerNote: 'If you did not request this, no action is needed and your password stays the same.'
      });
      const mailPromise = sendMail({
        to: email,
        subject: 'Reset your RAKOTEE password',
        html: resetHtml,
        text: `Reset your password using this secure link (valid for 1 hour): ${resetUrl}`
      });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SMTP timeout')), 12000);
      });
      const { preview } = await Promise.race([mailPromise, timeoutPromise]);
      if (preview) console.log('Ethereal preview URL (reset request):', preview);
    } catch (mailErr) {
      emailDelivered = false;
      console.error('Forgot-password mail send failed:', mailErr.message);
    }

    res.json({
      message: emailDelivered
        ? 'If that email exists, a reset link has been sent.'
        : 'Email delivery is unavailable right now. Use the secure reset link below to continue.',
      resetUrl: emailDelivered ? undefined : resetUrl
    });
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
    }
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  const resetDoneHtml = buildEmailTemplate({
    title: 'Password updated',
    intro: `Hi ${user.username || 'there'}, your password has been updated successfully.`,
    bodyHtml: '<p>If this was not you, secure your account immediately by resetting your password again.</p>',
    ctaLabel: 'Sign in to your account',
    ctaUrl: `${process.env.CLIENT_URL || 'https://rakotee.site'}/login.html`,
    footerNote: 'Thanks for helping keep your account secure.'
  });
  const { preview } = await sendMail({
    to: user.email,
    subject: 'RAKOTEE password reset successful',
    html: resetDoneHtml,
    text: 'Your password was reset successfully. If this was not you, contact support immediately.'
  });
  if (preview) console.log('Ethereal preview URL (reset complete):', preview);
  res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.inspectUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password for security
    res.json(users);
  } catch (err) {
    console.error('Inspect users error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.account = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token.' });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Fetch only successfully completed/paid orders for account history.
    const orders = await Order.find({
      email: user.email,
      $or: [
        { paid: true },
        { status: { $regex: /^(paid|completed|delivered)$/i } }
      ]
    }).sort({ createdAt: -1 });
    const addresses = Array.isArray(user.addresses) ? user.addresses : [];
    const safeDefaultIndex = Number.isInteger(user.defaultAddressIndex) ? user.defaultAddressIndex : 0;
    const defaultAddress = addresses[safeDefaultIndex] || null;
    const defaultAddressString = defaultAddress
      ? [defaultAddress.fullName, defaultAddress.address, defaultAddress.city, defaultAddress.postalCode, defaultAddress.country]
          .filter(Boolean)
          .join(', ')
      : (user.shippingAddress || '');

    res.json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      shippingAddress: defaultAddressString,
      addresses,
      defaultAddressIndex: safeDefaultIndex,
      emailVerified: user.emailVerified,
      profilePic: user.profilePic,
      orderHistory: orders
    });
  } catch (err) {
    console.error('Account fetch error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { username, email, profilePic, addresses, defaultAddressIndex, shippingAddress } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePic) user.profilePic = profilePic;

    if (Array.isArray(addresses)) {
      user.addresses = addresses
        .filter((a) => a && typeof a === 'object')
        .map((a) => ({
          fullName: (a.fullName || '').toString().trim(),
          address: (a.address || '').toString().trim(),
          city: (a.city || '').toString().trim(),
          postalCode: (a.postalCode || '').toString().trim(),
          country: (a.country || '').toString().trim()
        }))
        .filter((a) => a.address);
    }

    if (typeof defaultAddressIndex === 'number' && Number.isInteger(defaultAddressIndex)) {
      const maxIndex = Array.isArray(user.addresses) && user.addresses.length ? user.addresses.length - 1 : 0;
      user.defaultAddressIndex = Math.min(Math.max(defaultAddressIndex, 0), maxIndex);
    }

    if (typeof shippingAddress === 'string') {
      user.shippingAddress = shippingAddress.trim();
    }

    if (Array.isArray(user.addresses) && user.addresses.length) {
      const idx = Number.isInteger(user.defaultAddressIndex) ? user.defaultAddressIndex : 0;
      const selected = user.addresses[idx] || user.addresses[0];
      user.shippingAddress = [selected.fullName, selected.address, selected.city, selected.postalCode, selected.country]
        .filter(Boolean)
        .join(', ');
      user.defaultAddressIndex = user.addresses[idx] ? idx : 0;
    }

    await user.save();
    res.json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      shippingAddress: user.shippingAddress,
      addresses: user.addresses || [],
      defaultAddressIndex: Number.isInteger(user.defaultAddressIndex) ? user.defaultAddressIndex : 0,
      emailVerified: user.emailVerified,
      profilePic: user.profilePic,
      orderHistory: user.orderHistory || []
    });
  } catch (err) {
    console.error('Update account error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { currentPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect.' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  const changedHtml = buildEmailTemplate({
    title: 'Security alert: password changed',
    intro: `Hi ${user.username || 'there'}, your RAKOTEE password was changed.`,
    bodyHtml: '<p>If this was not you, use the forgot-password flow immediately to secure your account.</p>',
    ctaLabel: 'Reset password now',
    ctaUrl: `${process.env.CLIENT_URL || 'https://rakotee.site'}/forgot-password.html`,
    footerNote: 'If you made this change, no further action is needed.'
  });
  const { preview } = await sendMail({
    to: user.email,
    subject: 'Security alert: your RAKOTEE password changed',
    html: changedHtml,
    text: 'Your password was changed. If this was not you, reset your password immediately.'
  });
  if (preview) console.log('Ethereal preview URL (password change):', preview);
  res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.deleteOne();
    res.json({ message: 'Account deleted.' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.emailVerified) {
      return res.json({ message: 'Email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const clientUrl = process.env.CLIENT_URL || 'https://rakotee.site';
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    const verifyHtml = buildEmailTemplate({
      title: 'Verify your email',
      intro: `Hi ${user.username || 'there'}, please confirm your email address.`,
      bodyHtml: '<p>Use the button below to verify your account and keep your profile secure.</p>',
      ctaLabel: 'Verify email address',
      ctaUrl: verifyUrl,
      footerNote: 'If you did not request this, you can ignore this email.'
    });

    await sendMail({
      to: user.email,
      subject: 'Verify your RAKOTEE email address',
      html: verifyHtml,
      text: `Verify your RAKOTEE email address: ${verifyUrl}`
    });

    user.emailVerificationToken = verificationToken;
    await user.save();
    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
