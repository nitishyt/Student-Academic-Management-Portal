const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      console.log('📁 Collections:', collections.map(c => c.name));
      mongoose.connection.close();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
