require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function deleteAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting users:', err);
    process.exit(1);
  }
}

deleteAllUsers();
