import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';
import favoritesRoutes from './routes/favorites.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

connectDB();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);

// Health check - includes MongoDB connection status
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoConnected = mongoState === 1; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const mongoStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown';
  res.json({
    status: 'ok',
    mongodb: {
      connected: mongoConnected,
      status: mongoStatus,
      readyState: mongoState,
    },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
