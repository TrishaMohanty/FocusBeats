import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import sessionRoutes from './routes/sessions.js';
import musicRoutes from './routes/music.js';
import plannerRoutes from './routes/planner.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://focus-beats.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables');
}

// 🔌 Attempting MongoDB connection
mongoose.connect(mongoURI || 'mongodb://127.0.0.1:27017/focusbeats')
  .then(() => 
    console.log(
      `✅ MongoDB connected successfully to: ${mongoURI ? '🌐 External DB' : '💻 Local DB'}`
    )
  )
  .catch((err) => {
    console.error('🚨 MongoDB connection error details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Reason:', err.reason);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route for health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FocusBeats API is running...',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
