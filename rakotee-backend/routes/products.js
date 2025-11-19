// Example for routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Apply security middleware
router.use(helmet());
router.use(cors());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes (require authentication)
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
