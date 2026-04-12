const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String },
  name: { type: String },
  email: { type: String, required: true },
  address: { type: String },
  cart: [{ type: mongoose.Schema.Types.Mixed }],
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  paid: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },
  paymentMethod: { type: String },
  paymentRef: { type: String },
  refunded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
// ...existing code...
