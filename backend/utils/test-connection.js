#!/usr/bin/env node

import dotenv from 'dotenv';
import { connectToMongoDB } from '../config/database.js';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log(
    'MONGODB_URI:',
    process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'
  );
  console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE);

  try {
    const connected = await connectToMongoDB(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_manager'
    );
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
