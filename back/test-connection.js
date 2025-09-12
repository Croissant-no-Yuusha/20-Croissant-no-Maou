#!/usr/bin/env node

require('dotenv').config();
const { connectToMongoDB } = require('./database');

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE);
  
  try {
    const connected = await connectToMongoDB();
    if (connected) {
      console.log('✅ MongoDB connection successful!');
      console.log('📊 You can now use MongoDB storage');
    } else {
      console.log('❌ MongoDB connection failed');
      console.log('💡 Falling back to JSON storage');
    }
  } catch (error) {
    console.error('❌ Connection test error:', error.message);
  }
  
  process.exit(0);
}

testConnection();