import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import sessionRoutes from './routes/sessions.js';
import musicRoutes from './routes/music.js';
import plannerRoutes from './routes/planner.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';

import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes',
// });
// app.use('/api/', limiter);

app.use(express.json());
app.use('/music', express.static('public/music'));
app.use(express.static('public')); // General static files

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
  });
});

// Root route for direct requests and CORS checks
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to the FocusBeats backend',
    origin: req.headers.origin || null,
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server Function
const startServer = async () => {
  try {
    // 1. Connect to Database (Wait for it!)
    await connectDB();

    // 2. Start Listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server and Database Ready on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
