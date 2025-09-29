require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

async function deleteAllAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Admin.deleteMany({});
    console.log(`Deleted ${result.deletedCount} admin(s).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting admins:', err);
    process.exit(1);
  }
}

deleteAllAdmins();
