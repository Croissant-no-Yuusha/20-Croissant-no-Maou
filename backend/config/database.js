import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const connectToMongoDB = (connectionString) => {
  console.log('Connecting to MongoDB ...');
  return mongoose.connect(connectionString).then(
    () => {
      console.log('✅ MongoDB connected successfully');
      return true;
    },
    (error) => {
      console.error('❌ MongoDB connection error:', error);
      return false;
    }
  );
};

export { connectToMongoDB };
