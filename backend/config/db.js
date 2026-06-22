import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB database
 */
const connectDB = async () => {
  try {
    // Disable buffering globally so queries fail fast if the database is offline
    mongoose.set('bufferCommands', false);
    
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flavors_and_fork';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000 // Fail fast after 2 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Server is running in fallback mode (Database connection offline)...');
  }
};

export default connectDB;
