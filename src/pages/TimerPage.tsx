import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';

export function TimerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Initial State Loading
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

  const [sessionMetadata, setSessionMetadata] = useState<any>(getInitialSession());
  const [sessionType, setSessionType] = useState<'work' | 'short_break'>('work');
  
  // Timer State
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('focusbeats_timer_is_running');
    return saved === null ? true : saved === 'true';
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('focusbeats_target_end_time');
    return saved ? parseInt(saved, 10) : null;
  });
  
  // Music State
  const [nowPlaying, setNowPlaying] = useState<{title: string, artist: string, genre: string} | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(isRunning);

  // Initialize or Restore target time correctly
  useEffect(() => {
    if (!targetEndTime) {
       // Only initialize if we don't have a saved one
       const initialDurationMs = (sessionMetadata.is_infinity ? 25 * 60 : sessionMetadata.duration_minutes * 60) * 1000;
       const newTarget = Date.now() + initialDurationMs;
       setTargetEndTime(newTarget);
       localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
       setTimeLeft(initialDurationMs / 1000);
    } else {
        // Restore from saved target
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

  // Sync isRunning to localStorage
  useEffect(() => {
    localStorage.setItem('focusbeats_timer_is_running', isRunning.toString());
    setIsPlayingMusic(isRunning);
  }, [isRunning]);

  // Handle Smart Music Selection
  useEffect(() => {
      const { activity_type, focus_level } = sessionMetadata;
      if (focus_level === 'high') {
          setNowPlaying({ title: "Binaural Focus Alpha", artist: "NeuroSound", genre: "Brainwave" });
      } else if (activity_type === 'coding') {
          setNowPlaying({ title: "Syntax Error", artist: "HackerBeats", genre: "Synthwave" });
      } else if (activity_type === 'reading') {
          setNowPlaying({ title: "Rainy Cafe", artist: "Lofi Vibes", genre: "Ambient" });
      } else {
          setNowPlaying({ title: "Deep Work Mix", artist: "FocusBeats", genre: "Lofi" });
      }
  }, [sessionMetadata]);

  // Robust Timestamp-Delta Timer
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
          // Pause
          setIsRunning(false);
          localStorage.setItem('focusbeats_time_left', timeLeft.toString());
          localStorage.removeItem('focusbeats_target_end_time');
      } else {
          // Resume
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
      
      navigate('/dashboard', { state: { showSummary: {
          duration_minutes: actualDuration,
          focus_score_earned: isAutoEnd ? 10 : 2,
          task_name: sessionMetadata.task_name
      }}});
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let totalSeconds = sessionMetadata.is_infinity ? (sessionType === 'work' ? 25*60 : 5*60) : sessionMetadata.duration_minutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-end mb-12">
        <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-1">
                {sessionMetadata.is_infinity ? "Infinity Loop" : "Fixed Session"}
            </p>
            <h2 className="text-5xl font-black tracking-tighter text-on-surface">Focus Timer</h2>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Task</p>
            <p className="text-xl font-black text-primary">{sessionMetadata.task_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-outline-variant/10 shadow-[0px_32px_64px_rgba(25,28,29,0.06)] relative overflow-hidden">
            
            {sessionMetadata.is_infinity && (
                <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-full animate-pulse border border-primary/20">
                    <span className="material-symbols-outlined text-xl">all_inclusive</span>
                    <span className="text-xs font-black uppercase tracking-widest">Infinity Mode Active</span>
                </div>
            )}

            <div className="relative w-96 h-96 flex items-center justify-center mb-16 group">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                    <circle
                      cx="192"
                      cy="192"
                      r="170"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-surface-container-low"
                    />
                    <circle
                      cx="192"
                      cy="192"
                      r="170"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={1068}
                      strokeDashoffset={1068 - (1068 * progress) / 100}
                      strokeLinecap="round"
                      className={`${sessionType === 'work' ? 'text-primary' : 'text-emerald-500'} transition-all duration-300`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <span className="text-8xl font-black tracking-tighter text-on-surface tabular-nums">{formatTime(timeLeft)}</span>
                     <div className="mt-4 flex flex-col items-center gap-2">
                         <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${sessionType === 'work' ? 'text-slate-400' : 'text-emerald-500'}`}>
                             {sessionType === 'work' ? 'Deep Work' : 'Break Time'}
                         </span>
                         <div className="flex gap-2 mt-4">
                             <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] uppercase font-black">{sessionMetadata.activity_type}</span>
                             <span className="px-3 py-1 bg-surface-container text-slate-500 rounded-full text-[10px] uppercase font-black">{sessionMetadata.focus_level}</span>
                         </div>
                     </div>
                </div>
            </div>

            <div className="flex items-center gap-12 relative z-10">
              <button
                className={`w-28 h-28 rounded-[40px] flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
                  isRunning 
                    ? 'bg-white dark:bg-slate-800 text-on-surface border border-outline-variant/10 shadow-lg' 
                    : 'bg-gradient-to-br from-primary to-primary-container text-white shadow-primary/30'
                }`}
                onClick={toggleTimer}
              >
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                className="w-20 h-20 rounded-3xl bg-surface-container text-slate-400 hover:text-error hover:bg-error-container/20 active:scale-95 transition-all flex items-center justify-center"
                onClick={() => endSession(false)}
              >
                <span className="material-symbols-outlined text-3xl">stop</span>
              </button>
            </div>
            
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${sessionType === 'work' ? 'bg-primary/5' : 'bg-emerald-500/5'}`}></div>
          </div>

          <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#191C1D] to-[#2E3132] rounded-[40px] p-8 text-white relative overflow-hidden group border border-[#BBCABF]/10">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                          <div>
                              <p className="text-[10px] uppercase font-black tracking-widest text-[#BBCABF]">Smart Audio</p>
                              <h3 className="text-xl font-bold tracking-tight">Now Playing</h3>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${isPlayingMusic ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
                      </div>

                      {nowPlaying && (
                          <div className="flex gap-4 items-center mb-8">
                             <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/20 flex items-center justify-center relative">
                                 <span className="material-symbols-outlined text-3xl text-primary-fixed">music_note</span>
                                 {isPlayingMusic && (
                                    <div className="absolute inset-0 bg-primary/10 animate-ping rounded-2xl"></div>
                                 )}
                             </div>
                             <div>
                                 <p className="font-black text-lg line-clamp-1">{nowPlaying.title}</p>
                                 <p className="text-sm font-bold text-slate-400">{nowPlaying.artist}</p>
                                 <span className="inline-block mt-2 px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold text-slate-300 uppercase">{nowPlaying.genre}</span>
                             </div>
                          </div>
                      )}

                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl">
                          <button className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-slate-300">
                             <span className="material-symbols-outlined">skip_previous</span>
                          </button>
                          <button 
                             className="w-14 h-14 flex items-center justify-center rounded-xl bg-white text-black hover:scale-105 transition-transform font-black"
                             onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                          >
                             <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isPlayingMusic ? 'pause' : 'play_arrow'}
                             </span>
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-slate-300">
                             <span className="material-symbols-outlined">skip_next</span>
                          </button>
                      </div>
                  </div>
              </div>

              {!sessionMetadata.is_infinity && (
                 <div className="bg-surface-container-low rounded-[32px] p-8 border border-outline-variant/10">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-sm font-bold">Session Progress</span>
                         <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
                     </div>
                     <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
                         <div 
                             className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000"
                             style={{ width: `${progress}%` }}
                         />
                     </div>
                     <p className="text-xs text-slate-500 mt-4 font-medium text-center">
                         Stay focused! You'll be done at {targetEndTime ? new Date(targetEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}.
                     </p>
                 </div>
              )}
          </div>
      </div>
    </div>
  );
}
