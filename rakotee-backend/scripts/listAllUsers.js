require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      console.log('Users:');
      users.forEach(user => {
        console.log({
          _id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified
        });
      });
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
}

listAllUsers();
