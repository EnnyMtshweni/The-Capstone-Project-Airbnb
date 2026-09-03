/**
 * seedAdmin.js — create the admin account in MongoDB
 * Run: node seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  const email = 'admin@airbnb-sa.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${email}  (role: ${existing.role})`);
    // Ensure role is admin in case it was created differently
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('✅  Role corrected to admin');
    }
  } else {
    // Hash manually because we're bypassing the pre-save hook via create()
    const hashed = await bcrypt.hash('Admin@1234', 10);
    await User.create({
      name:     'SA Admin',
      email,
      password: hashed,
      role:     'admin',
    });
    console.log(`✅  Admin created:  ${email}  /  Admin@1234`);
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('seedAdmin failed:', e.message); process.exit(1); });
