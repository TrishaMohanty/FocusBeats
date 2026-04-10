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
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/focusbeats')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.json({ message: 'FocusBeats API is running...' });
});

// Export app for Vercel
export default app;

// Start Server (only if not imported)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
