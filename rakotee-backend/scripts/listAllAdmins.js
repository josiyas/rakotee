require('dotenv').config();
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Admin = mongoose.model('Admin', adminSchema);

async function listAllAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await Admin.find({}, 'email');
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      console.log('Admin users:');
      admins.forEach((admin, i) => {
        console.log(`${i + 1}. ${admin.email}`);
      });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error listing admins:', err);
    process.exit(1);
  }
}

listAllAdmins();
