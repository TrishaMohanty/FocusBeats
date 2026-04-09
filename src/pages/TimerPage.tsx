import { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';


export function TimerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialSession = () => {
    if (location.state?.sessionData) {
      const data = location.state.sessionData;
      localStorage.setItem('focusbeats_active_session', JSON.stringify(data));
      return data;
    }
    const saved = localStorage.getItem('focusbeats_active_session');
    if (saved) return JSON.parse(saved);
    return { activity_type: 'coding', focus_level: 'medium', task_name: 'Deep Work', duration_minutes: 25, session_type: 'work', is_infinity: false };
  };

  const { isPlaying } = useAudio();
  const [sessionMetadata] = useState<any>(getInitialSession());
  const [sessionType, setSessionType] = useState<'work' | 'short_break'>('work');

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('focusbeats_timer_is_running');
    return saved === null ? true : saved === 'true';
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('focusbeats_target_end_time');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    if (!targetEndTime) {
      const initialDurationMs = (sessionMetadata.is_infinity ? 25 * 60 : sessionMetadata.duration_minutes * 60) * 1000;
      const newTarget = Date.now() + initialDurationMs;
      setTargetEndTime(newTarget);
      localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
      setTimeLeft(initialDurationMs / 1000);
    } else {
      if (isRunning) {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        const savedTimeLeft = localStorage.getItem('focusbeats_time_left');
        setTimeLeft(savedTimeLeft ? parseInt(savedTimeLeft, 10) : 0);
      }
    }
    localStorage.setItem('focusbeats_timer_is_running', isRunning.toString());
  }, [sessionMetadata]);

  useEffect(() => {
    localStorage.setItem('focusbeats_timer_is_running', isRunning.toString());
  }, [isRunning]);

  useEffect(() => {
    const { activity_type, focus_level } = sessionMetadata;
    
    api.get(`/music?activity_type=${activity_type}&focus_level=${focus_level}`)
      .then(() => {
        // We can still fetch music if we want to play it, but we've removed the manual queue for now.
      })
      .catch(console.error);
  }, [sessionMetadata]);

  useEffect(() => {
    let animationFrame: number;
    const tick = () => {
      if (isRunning && targetEndTime) {
        const remainingMs = targetEndTime - Date.now();
        if (remainingMs <= 0) {
          setTimeLeft(0);
          handleTimerComplete();
        } else {
          setTimeLeft(Math.ceil(remainingMs / 1000));
          animationFrame = requestAnimationFrame(tick);
        }
      }
    };
    if (isRunning) {
      animationFrame = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, targetEndTime, sessionType, sessionMetadata]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    localStorage.removeItem('focusbeats_target_end_time');
    localStorage.removeItem('focusbeats_time_left');

    if (sessionMetadata.is_infinity) {
      if (sessionType === 'work') {
        setSessionType('short_break');
        const newTarget = Date.now() + 5 * 60 * 1000;
        setTargetEndTime(newTarget);
        localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
        setIsRunning(true);
      } else {
        setSessionType('work');
        const newTarget = Date.now() + 25 * 60 * 1000;
        setTargetEndTime(newTarget);
        localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
        setIsRunning(true);
      }
    } else {
      endSession(true);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      localStorage.setItem('focusbeats_time_left', timeLeft.toString());
      localStorage.removeItem('focusbeats_target_end_time');
    } else {
      const newTarget = Date.now() + timeLeft * 1000;
      setTargetEndTime(newTarget);
      localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
      localStorage.removeItem('focusbeats_time_left');
      setIsRunning(true);
    }
  };

  const endSession = async (isAutoEnd: boolean = false) => {
    if (!isAutoEnd) {
      if (!window.confirm("Are you sure you want to end this session early?")) return;
    }
    let actualDuration = sessionMetadata.duration_minutes;
    if (sessionMetadata.is_infinity) {
      actualDuration = 25;
    } else if (!isAutoEnd) {
      actualDuration = Math.round((sessionMetadata.duration_minutes * 60 - timeLeft) / 60);
    }

    localStorage.removeItem('focusbeats_active_session');
    localStorage.removeItem('focusbeats_target_end_time');
    localStorage.removeItem('focusbeats_time_left');
    localStorage.removeItem('focusbeats_timer_is_running');

    if (user) {
      try {
        const result = await api.post('/sessions', {
          duration_minutes: actualDuration,
          session_type: 'work',
          activity_type: sessionMetadata.activity_type,
          focus_level: sessionMetadata.focus_level,
          task_name: sessionMetadata.task_name,
          completed: isAutoEnd
        });
        navigate('/dashboard', { state: { showSummary: result } });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    navigate('/dashboard', {
      state: {
        showSummary: {
          duration_minutes: actualDuration,
          focus_score_earned: isAutoEnd ? 10 : 2,
          task_name: sessionMetadata.task_name
        }
      }
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let totalSeconds = sessionMetadata.is_infinity ? (sessionType === 'work' ? 25 * 60 : 5 * 60) : sessionMetadata.duration_minutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden px-4 md:px-8">
      
      <div className="w-full max-w-4xl flex flex-col items-center justify-center h-full min-h-0 py-8">
        
        {/* The Watch */}
        <div className="flex flex-col items-center justify-center relative w-full">
          
          {/* Internal Watch Container */}
          <div className="relative flex items-center justify-center w-full max-w-[min(60vh,420px)] aspect-square mb-12">
            
            {/* Progress Ring with Breathing Effect */}
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-bg/50"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="283%"
                strokeDashoffset={`${283 - (283 * progress) / 100}%`}
                strokeLinecap="round"
                className={`${sessionType === 'work' ? `text-primary-500 ${isRunning ? 'animate-pulse-slow' : ''}` : 'text-info'} transition-all duration-1000 ease-linear`}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-xl">
              <div className="mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted mb-2 opacity-60">
                  {sessionMetadata.is_infinity ? "Infinity Loop" : "Deep Flow Mode"}
                </p>
                <h3 className="text-2xl font-black text-text tracking-tight truncate max-w-[280px] drop-shadow-sm">
                  {sessionMetadata.task_name}
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-[72px] font-black text-text tracking-tighter tabular-nums leading-none mb-4 drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-1.5 bg-bg border border-border rounded-full shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${sessionType === 'work' ? 'bg-primary-500 shadow-[0_0_8px_var(--color-primary-500)]' : 'bg-info shadow-[0_0_8px_var(--color-info)]'}`}></span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
                      {sessionType === 'work' ? 'Concentrating' : 'Recharging'}
                    </span>
                  </div>
                </div>
                
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-rounded text-sm">schedule</span>
                  Expected Finish: <span className="text-text">{targetEndTime ? new Date(targetEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Controls - Tightened z-index and spacing */}
          <div className="flex items-center gap-8 z-20">
            <button
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 hover:scale-110 ${isRunning
                  ? 'bg-surface text-text border border-border shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                  : 'bg-primary-500 text-white shadow-2xl shadow-primary-500/40'
                }`}
              onClick={toggleTimer}
            >
              <span className="material-symbols-rounded text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              className="w-14 h-14 rounded-full bg-surface text-error border border-border flex items-center justify-center hover:bg-error hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md group"
              onClick={() => endSession(false)}
              title="End Session"
            >
              <span className="material-symbols-rounded text-3xl group-hover:rotate-90 transition-transform">stop</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] blur-[160px] rounded-full pointer-events-none transition-all duration-1000 ${
        isPlaying ? 'opacity-30 scale-110' : 'opacity-10 scale-100'
      } ${sessionType === 'work' ? 'bg-primary-500 animate-pulse-slow' : 'bg-info'}`}></div>
    </div>
  );
}
