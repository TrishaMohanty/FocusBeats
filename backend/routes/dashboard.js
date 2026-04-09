import express from 'express';
import Task from '../models/Task.js';
import StudySession from '../models/StudySession.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard related stats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get stats from DB
    const [tasksRes, sessionsRes, userRes] = await Promise.all([
      Task.find({ user_id: req.user._id, completed: true }),
      StudySession.find({ 
        user_id: req.user._id, 
        completed_at: { $gte: today } 
      }).sort({ completed_at: -1 }).limit(5),
      User.findById(req.user._id).select('focus_score'),
    ]);

    // Count tasks completed today
    const tasksCount = tasksRes.filter(t => {
      const taskDate = new Date(t.updatedAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    res.json({
      focusScore: userRes?.focus_score || 0,
      sessionsToday: sessionsRes.length,
      tasksCompleted: tasksCount,
      streakDays: 5, // A stub streak since we don't have streaks implemented correctly yet
      recentSessions: sessionsRes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
