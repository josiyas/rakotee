const mongoose = require('mongoose');
const { Schema } = mongoose;

const IpnLogSchema = new Schema({
  provider: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
  payload: { type: Schema.Types.Mixed },
  headers: { type: Schema.Types.Mixed },
  verificationResponse: { type: String },
  verified: { type: Boolean, default: false },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IpnLog', IpnLogSchema);
