const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  images: { type: [String], default: [] },
  variants: { type: mongoose.Schema.Types.Mixed },
  stock: { type: Number, default: 0 },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
