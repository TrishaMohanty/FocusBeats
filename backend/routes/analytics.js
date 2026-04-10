import express from 'express';
import StudySession from '../models/StudySession.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user_id: req.user._id }).sort({ completed_at: -1 });

    const workSessions = sessions.filter(s => s.session_type === 'work');
    const breakSessions = sessions.filter(s => s.session_type !== 'work');

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const workMinutes = workSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const totalSessions = sessions.length;
    const workSessionsCount = workSessions.length;
    
    const avgSession = workSessionsCount > 0 ? Math.round(workMinutes / workSessionsCount) : 0;

    // Daily study time for last 7 days (Focus work only)
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
                return sd.getTime() === d.getTime() && s.session_type === 'work';
            })
            .reduce((acc, s) => acc + s.duration_minutes, 0);
            
        last7Days.push({ day: dayName, minutes });
    }

    // Focus score trend
    const trend = last7Days.map(d => ({
        day: d.day,
        score: Math.min(100, (d.minutes / 180) * 100)
    }));

    res.json({
      metrics: {
        totalTimeHrs: (workMinutes / 60).toFixed(1),
        grossTimeHrs: (totalMinutes / 60).toFixed(1),
        totalSessions: workSessionsCount,
        avgSessionMin: avgSession,
        breakMinutes: totalMinutes - workMinutes
      },
      dailyTime: last7Days,
      focusTrend: trend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
