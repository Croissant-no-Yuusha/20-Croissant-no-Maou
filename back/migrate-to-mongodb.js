#!/usr/bin/env node

/**
 * Migration Script: JSON to MongoDB
 *
 * This script helps you migrate from JSON file storage to MongoDB
 *
 * Usage:
 * 1. Set up your MongoDB connection in .env file
 * 2. Run: node migrate-to-mongodb.js
 */

require('dotenv').config();
import { connectToMongoDB, migrateJsonToMongoDB } from './database';
import { resolve } from 'path';

async function runMigration() {
  try {
    console.log('🚀 Starting migration from JSON to MongoDB...');

    // Check if MongoDB connection string is configured
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('Please add your MongoDB connection string to .env:');
      console.log('MONGODB_URI=mongodb://localhost:27017/recipe_manager');
      process.exit(1);
    }

    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('❌ Failed to connect to MongoDB');
      process.exit(1);
    }

    // Get JSON file path
    const jsonFilePath = process.env.RECIPES_FILE_PATH || './recipes.json';
    const fullPath = resolve(__dirname, jsonFilePath);

    console.log(`📁 Reading from: ${fullPath}`);

    // Run migration
    const success = await migrateJsonToMongoDB(fullPath);

    if (success) {
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Update your .env file to switch to MongoDB:');
      console.log('   STORAGE_TYPE=mongodb');
      console.log('2. Restart your server');
      console.log('3. Your JSON file has been backed up');
    } else {
      console.error('❌ Migration failed');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

export default { runMigration };
