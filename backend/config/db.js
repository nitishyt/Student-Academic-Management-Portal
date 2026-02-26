const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  // allow falling back to a local database when no URI is provided (development)
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal';

  // warn if no explicit URI was provided (e.g. empty .env) so developer knows
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set, defaulting to local MongoDB at', uri);
  }

  // validate scheme early so mistakes are obvious
  if (typeof uri !== 'string' || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.error('❌ Invalid MongoDB URI scheme. Please set MONGODB_URI to a proper connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.error('👉 Tip: Check your database credentials in the .env file.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
