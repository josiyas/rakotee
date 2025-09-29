require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  const email = 'rakoteeholdings@gmail.com';
  const password = '2006Josiyas21!';
  const role = 'superadmin'; // Change to 'admin' or 'editor' as needed
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists.');
      process.exit(0);
    }
    // Do NOT hash the password here; let the model's pre-save hook handle it
  const admin = new Admin({ email, password, role });
    await admin.save();
    console.log('Admin created successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
