import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file for local development; on Vercel, env vars are injected by the platform
try {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch {
  // Silently ignore - Vercel injects env vars directly
}

import connectToDatabase from './config/db.js';
import authRoutes from './routes/auth.js';
import locationRoutes from './routes/locations.js';
import postRoutes from './routes/posts.js';
import aiRoutes from './routes/ai.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Flexible CORS for local development & Vercel deployment
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === FRONTEND_URL ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Ensure DB Connection Middleware for Serverless & Long-running
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed in request middleware:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);

// Only start listening locally, not on Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Express Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
