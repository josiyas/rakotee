const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String },
  email: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  paid: { type: Boolean, default: false },
  refunded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
// ...existing code...
