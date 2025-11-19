require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/admin');

async function createAdmin(email, password) {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let admin = await Admin.findOne({ email });
  if (admin) {
    console.log('Admin already exists. Updating password...');
    admin.password = password;
    await admin.save();
    console.log('Password updated successfully');
  } else {
    admin = new Admin({ email, password, role: 'admin' });
    await admin.save();
    console.log('Admin created successfully');
  }
  mongoose.disconnect();
}

const email = 'rakoteeholdings@gmail.com';
const password = '2025Josiyas21!';
createAdmin(email, password);
