const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const reset = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin reset...");

    const db = mongoose.connection.db;
    const users = db.collection('users');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@1234', salt);

    const result = await users.updateOne(
      { email: 'admin@hms.com' },
      { $set: { password: hash } }
    );

    if (result.matchedCount > 0) {
      console.log("✅ Admin password reset to 'Admin@1234' successfully!");
    } else {
      console.log("❌ User 'admin@hms.com' not found in database.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Reset Error:", err);
    process.exit(1);
  }
};

reset();
