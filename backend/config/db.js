import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  logger.info(`📡 Attempting to connect to: ${mongoURI ? 'External MongoDB' : 'Local MongoDB (Fallback)'}`);
  try {
    const conn = await mongoose.connect(mongoURI || 'mongodb://127.0.0.1:27017/focusbeats', {
      serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 10s
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    logger.info(`✅ MongoDB connected successfully to: ${mongoURI ? '🌐 External DB' : '💻 Local DB'}`);
    return conn;
  } catch (error) {
    logger.error('❌ MongoDB connection error details:');
    logger.error(`Message: ${error.message}`);
    logger.error(`Code: ${error.code || 'N/A'}`);
    if (error.reason) logger.error(`Reason: ${JSON.stringify(error.reason)}`);
    process.exit(1);
  }
};

export default connectDB;
