/**
 * seedAdmin.js — create the admin account in MongoDB
 * Run: node seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  const email = 'admin@airbnb-sa.com';
  const password = 'Admin@1234';
  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${email}  (role: ${existing.role})`);

    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('✅  Role corrected to admin');
    }

    existing.password = password;
    await existing.save();
    console.log('✅  Admin password reset to the correct value');
  } else {
    await User.create({
      name: 'SA Admin',
      email,
      password,
      role: 'admin',
    });
    console.log(`✅  Admin created:  ${email}  /  ${password}`);
  }

  await mongoose.disconnect();
}

run().catch(e => { console.error('seedAdmin failed:', e.message); process.exit(1); });
