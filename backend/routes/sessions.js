import express from 'express';
import StudySession from '../models/StudySession.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get all study sessions for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user_id: req.user._id }).sort({ completed_at: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/sessions
// @desc    Create a study session
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { duration_minutes, session_type, notes, activity_type, focus_level, task_name, completed } = req.body;

    if (duration_minutes === undefined || !session_type) {
      return res.status(400).json({ message: 'Duration and session type are required' });
    }

    const session = await StudySession.create({
      user_id: req.user._id,
      duration_minutes,
      session_type,
      activity_type: activity_type || 'coding',
      focus_level: focus_level || 'medium',
      task_name,
      notes: notes || null,
      completed_at: new Date(),
    });

    let earnedScore = 0;

    // Advanced Focus Score Calculation
    if (session_type === 'work' && duration_minutes > 0) {
      let multiplier = 1.0;
      if (focus_level === 'high') multiplier = 1.5;
      else if (focus_level === 'medium') multiplier = 1.2;
      
      earnedScore = Math.round(duration_minutes * multiplier);
      if (completed) earnedScore += 5; // Completion bonus

      const user = await User.findById(req.user._id);
      if (user) {
        user.focus_score = (user.focus_score || 0) + earnedScore;
        await user.save();
      }
    }

    res.status(201).json({ ...session.toObject(), focus_score_earned: earnedScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
