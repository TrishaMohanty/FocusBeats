import express from 'express';
import MusicTrack from '../models/MusicTrack.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/music
// @desc    Get all music tracks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { focus_level, activity_type, category } = req.query;
    
    // Construct query object
    let query = {
      $or: [
        { user_id: req.user._id },
        { user_id: null } // system tracks
      ]
    };

    if (focus_level) query.focus_level = focus_level;
    if (activity_type) query.activity_type = activity_type;
    if (category) query.category = category;

    const tracks = await MusicTrack.find(query).sort({ created_at: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/music
// @desc    Add a custom music track
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, category, focus_level, activity_type, embed_url } = req.body;

    if (!title || !category || !focus_level || !activity_type || !embed_url) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const track = await MusicTrack.create({
      user_id: req.user._id, // Add to current user
      title,
      category,
      focus_level,
      activity_type,
      embed_url,
    });

    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
