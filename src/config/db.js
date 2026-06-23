const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var is not set');
  if (!uri.includes('/iships_db')) {
    console.warn('Warning: MONGODB_URI may be missing the database name (expected /iships_db)');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
}

module.exports = connectDB;
