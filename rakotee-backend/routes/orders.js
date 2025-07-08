// Example for routes/auth.js
const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Security middleware
router.use(helmet());
router.use(cors());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Dummy route
router.get('/', (req, res) => {
  res.send('Auth route working');
});

module.exports = router;
