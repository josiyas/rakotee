const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  discount: { type: Number, default: 0 }, // percentage or fixed
  type: { type: String, enum: ['percentage', 'fixed', 'banner', 'campaign'], default: 'percentage' },
  active: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Promotion', PromotionSchema);
