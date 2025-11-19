require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/admin');

async function updateAdminPassword(email, newPassword) {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.error('Admin not found');
    process.exit(1);
  }
  admin.password = newPassword;
  await admin.save();
  console.log('Password updated successfully');
  mongoose.disconnect();
}

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const newPassword = '2025Josiyas21!';
updateAdminPassword(email, newPassword);
