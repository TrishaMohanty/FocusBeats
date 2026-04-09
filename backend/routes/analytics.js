import express from 'express';
import StudySession from '../models/StudySession.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user_id: req.user._id }).sort({ completed_at: -1 });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const totalSessions = sessions.length;
    const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Daily study time for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const minutes = sessions
            .filter(s => {
                const sd = new Date(s.completed_at);
                sd.setHours(0,0,0,0);
                return sd.getTime() === d.getTime();
            })
            .reduce((acc, s) => acc + s.duration_minutes, 0);
            
        last7Days.push({ day: dayName, minutes });
    }

    // Focus score trend (mock for now based on sessions)
    const trend = last7Days.map(d => ({
        day: d.day,
        score: Math.min(100, (d.minutes / 120) * 100) + Math.floor(Math.random() * 20)
    }));

    res.json({
      metrics: {
        totalTimeHrs: (totalMinutes / 60).toFixed(1),
        totalSessions,
        avgSessionMin: avgSession
      },
      dailyTime: last7Days,
      focusTrend: trend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
