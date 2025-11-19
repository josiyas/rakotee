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
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}&email=${email}`;
  const { preview } = await sendMail({ to: email, subject: 'Verify your email', html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>` });
  if (preview) console.log('Ethereal preview URL (registration):', preview);
    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
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
  const { preview } = await sendMail({ to: user.email, subject: 'Email verified', html: `<p>Your email has been verified. You can now log in.</p>` });
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
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
  const { preview } = await sendMail({ to: email, subject: 'Reset your password', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>` });
  if (preview) console.log('Ethereal preview URL (reset request):', preview);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
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
  const { preview } = await sendMail({ to: user.email, subject: 'Password reset successful', html: `<p>Your password has been reset successfully. If this wasn't you, contact support.</p>` });
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
    // Fetch orders for this user
    const orders = await Order.find({ email: user.email }).sort({ createdAt: -1 });
    res.json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      shippingAddress: user.shippingAddress,
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
    const { username, email, profilePic } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePic) user.profilePic = profilePic;
    await user.save();
    res.json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      shippingAddress: user.shippingAddress,
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
  const { preview } = await sendMail({ to: user.email, subject: 'Password changed', html: `<p>Your password was changed. If this wasn't you, please reset your password immediately.</p>` });
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
    // Simulate sending verification email
    user.emailVerified = true;
    await user.save();
    res.json({ message: 'Verification email sent.' });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
