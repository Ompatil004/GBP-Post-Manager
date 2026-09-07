import mongoose from 'mongoose';

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gbp_post_manager';

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

export default connectToDatabase;
