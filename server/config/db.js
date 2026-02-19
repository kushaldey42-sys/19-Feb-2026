import mongoose from 'mongoose';

/**
 * Connect to MongoDB - server stays up even if DB fails (for dev without MongoDB)
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Server will run but auth/signup will fail until MongoDB is available.');
    // Don't exit - allow server to start so frontend can at least reach it
  }
};
