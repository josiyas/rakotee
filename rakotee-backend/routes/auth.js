const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Security middleware
router.use(helmet());
router.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
router.use(limiter);

// Register with email verification
router.post('/register', authController.register);

// Email verification
router.get('/verify-email', authController.verifyEmail);

// Login (only if email verified)
router.post('/login', authController.login);

// Request password reset
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Inspect users (for debugging)
router.get('/inspect-users', authController.inspectUsers);

// Get user account information
router.get('/account', authController.account);
router.put('/account', authController.updateAccount);
router.put('/account/password', authController.changePassword);
router.delete('/account', authController.deleteAccount);
router.post('/account/send-verification', authController.sendVerification);

module.exports = router;