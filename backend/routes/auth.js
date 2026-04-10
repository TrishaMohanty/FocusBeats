import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validationMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Validation Schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    displayName: z.string().min(1, 'Display name is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;

  logger.debug(`Registration attempt for: ${email}`);

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    logger.warn(`Registration failed: User ${email} already exists`);
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    display_name: displayName,
  });

  if (user) {
    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      id: user._id,
      email: user.email,
      display_name: user.display_name,
      token: generateToken(user._id),
    });
  } else {
    logger.error('Registration failed: Invalid user data');
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

// @route   POST /api/auth/login
// @desc    Authenticate a user
// @access  Public
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.debug(`Login attempt for: ${email}`);

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Login failed: User not found for email ${email}`);
    res.status(401);
    throw new Error('Invalid credentials');
  }

  logger.debug(`User found: ${user.email}. Attempting password comparison...`);

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    logger.info(`User logged in successfully: ${email}`);
    res.json({
      id: user._id,
      email: user.email,
      display_name: user.display_name,
      token: generateToken(user._id),
    });
  } else {
    logger.warn(`Login failed: Password mismatch for user ${email}`);
    res.status(401);
    throw new Error('Invalid credentials');
  }
}));

// @route   GET /api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    display_name: req.user.display_name,
    focus_score: req.user.focus_score,
  });
}));

export default router;
