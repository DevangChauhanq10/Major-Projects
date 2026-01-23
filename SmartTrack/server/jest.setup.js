const mongoose = require('mongoose');

module.exports = async () => {
  // Connect to test database
  const testDB = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/smarttrack-test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDB);
  }
  
  // Drop all collections to start fresh
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  
  console.log('✓ Test database cleaned');
};
