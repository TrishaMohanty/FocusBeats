import express from 'express';
import PlannerEntry from '../models/PlannerEntry.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/planner
// @desc    Get all planner entries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const entries = await PlannerEntry.find({ user_id: req.user._id }).sort({ scheduled_date: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/planner
// @desc    Create a planner entry
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, scheduled_date, subject, notes } = req.body;

    if (!title || !scheduled_date || !subject) {
      return res.status(400).json({ message: 'Title, scheduled date and subject are required' });
    }

    const entry = await PlannerEntry.create({
      user_id: req.user._id,
      title,
      scheduled_date: new Date(scheduled_date),
      subject,
      notes: notes || null,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/planner/:id
// @desc    Delete a planner entry
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await PlannerEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Planner entry not found' });
    }

    if (entry.user_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await entry.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
