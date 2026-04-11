import { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { ACTIVITY_MAP } from '../lib/constants/activities';


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
    return { 
      activity_type: 'coding', 
      focus_level: 'medium', 
      task_name: 'Deep Work', 
      duration_minutes: 25, 
      session_type: 'work', 
      is_infinity: false,
      mode: 'focused',
      current_cycle: 1
    };
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      if (Notification.permission === "granted") {
        new Notification("Phase Complete", {
          body: `Time for your ${sessionType === 'work' ? 'break' : 'next focus session'}!`,
          icon: "/favicon.svg"
        });
      }
    } catch (e) {
      console.error("Audio/Notification failed", e);
    }
  };

  const { isPlaying, togglePlay, fadeVolume, playSmart, currentTrack } = useAudio();
  const [sessionMetadata, setSessionMetadata] = useState<any>(getInitialSession());
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>(() => {
    const saved = localStorage.getItem('focusbeats_session_type');
    return (saved as any) || 'work';
  });

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('focusbeats_timer_is_running');
    return saved === null ? true : saved === 'true';
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('focusbeats_target_end_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const [stickyNote] = useState(() => {
    return localStorage.getItem('focusbeats_timer_note') || "";
  });

  // Auto-play music on work start
  useEffect(() => {
    if (isRunning && sessionType === 'work' && !isPlaying) {
      playSmart(sessionMetadata.activity_type);
    }
  }, [isRunning, sessionType, sessionMetadata.activity_type, isPlaying]);

  // Phase-Aware Music: Pause during breaks
  useEffect(() => {
    if (sessionType !== 'work' && isPlaying) {
      togglePlay();
    }
  }, [sessionType]);

  const skipPhase = () => {
    if (window.confirm("Skip this phase?")) {
      handleTimerComplete();
      window.dispatchEvent(new Event('timer_state_change'));
    }
  };

  const resetPhase = () => {
    if (window.confirm("Restart this timer?")) {
      const getDuration = () => {
        if (sessionType !== 'work') {
          return sessionType === 'long_break' ? 15 * 60 : 5 * 60;
        }
        return (sessionMetadata.mode === 'pomodoro' || sessionMetadata.mode === 'infinity') ? 25 * 60 : sessionMetadata.duration_minutes * 60;
      };
      const durationMs = getDuration() * 1000;
      const newTarget = Date.now() + durationMs;
      setTargetEndTime(newTarget);
      localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
      setTimeLeft(durationMs / 1000);
      setIsRunning(true);
      window.dispatchEvent(new Event('timer_state_change'));
    }
  };

  const extendTime = (minutes: number = 5) => {
    const additionalMs = minutes * 60 * 1000;
    const currentTarget = targetEndTime || (Date.now() + timeLeft * 1000);
    const newTarget = currentTarget + additionalMs;
    setTargetEndTime(newTarget);
    localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
    setTimeLeft(prev => prev + minutes * 60);
    window.dispatchEvent(new Event('timer_state_change'));
  };

  useEffect(() => {
    localStorage.setItem('focusbeats_timer_note', stickyNote);
  }, [stickyNote]);

  useEffect(() => {
    if (!targetEndTime) {
      const getDuration = () => {
        if (sessionType !== 'work') {
          if (sessionType === 'long_break') return 15 * 60;
          return 5 * 60;
        }
        if (sessionMetadata.mode === 'pomodoro' || sessionMetadata.mode === 'infinity') {
          return 25 * 60;
        }
        return sessionMetadata.duration_minutes * 60;
      };

      const initialDurationMs = getDuration() * 1000;
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
    localStorage.setItem('focusbeats_session_type', sessionType);
  }, [sessionMetadata, sessionType]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyM') {
        togglePlay();
      } else if (e.code === 'Escape') {
        endSession(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, timeLeft, targetEndTime]);

  useEffect(() => {
    localStorage.setItem('focusbeats_timer_is_running', isRunning.toString());
  }, [isRunning]);

  useEffect(() => {
    const { activity_type, focus_level } = sessionMetadata;
    
    api.get(`/music?activity_type=${activity_type}&focus_level=${focus_level}`)
      .then(() => {
        // Track pre-fetching handled by Context
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

  const handleTimerComplete = async () => {
    setIsRunning(false);
    playChime();
    
    // Save the finished phase to DB
    await endSession(true, true);

    if (sessionMetadata.mode === 'focused' && !sessionMetadata.is_infinity) {
      // Standard session ends here
      return;
    }

    // Determine next phase
    let nextType: 'work' | 'short_break' | 'long_break' = 'work';
    let nextCycle = sessionMetadata.current_cycle || 1;

    if (sessionType === 'work') {
      // Work finished -> Break
      if (sessionMetadata.mode === 'pomodoro' && nextCycle % 4 === 0) {
        nextType = 'long_break';
        // Trigger Big Celebration
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      } else {
        nextType = 'short_break';
      }
    } else {
      // Break finished -> Work
      nextType = 'work';
      nextCycle += 1;
    }

    // Check if goal reached in Pomodoro mode
    if (sessionMetadata.mode === 'pomodoro' && nextCycle > (sessionMetadata.total_cycles || 999)) {
       navigate('/dashboard', { state: { message: "Goal Achieved! You completed your Pomodoro sets." } });
       return;
    }

    // Update metadata and restart
    const updatedMetadata = {
      ...sessionMetadata,
      current_cycle: nextCycle
    };
    setSessionMetadata(updatedMetadata);
    setSessionType(nextType);
    localStorage.setItem('focusbeats_active_session', JSON.stringify(updatedMetadata));
    localStorage.setItem('focusbeats_session_type', nextType);
    
    const nextDuration = nextType === 'work' ? 25 : (nextType === 'long_break' ? 15 : 5);
    const newTarget = Date.now() + nextDuration * 60 * 1000;
    setTargetEndTime(newTarget);
    localStorage.setItem('focusbeats_target_end_time', newTarget.toString());
    
    // Auto-start next phase
    setIsRunning(true);
    window.dispatchEvent(new Event('timer_state_change'));
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
    window.dispatchEvent(new Event('timer_state_change'));
  };

  const endSession = async (isAutoEnd: boolean = false, keepActive: boolean = false) => {
    if (!isAutoEnd) {
      if (!window.confirm("Are you sure you want to end this session early?")) return;
    }

    let actualDuration = 0;
    const plannedDuration = sessionType === 'work' 
      ? (sessionMetadata.mode !== 'focused' ? 25 : sessionMetadata.duration_minutes)
      : (sessionType === 'long_break' ? 15 : 5);

    if (isAutoEnd) {
      actualDuration = plannedDuration;
    } else {
      actualDuration = Math.round((plannedDuration * 60 - timeLeft) / 60);
    }

    if (!keepActive) {
      localStorage.removeItem('focusbeats_active_session');
      localStorage.removeItem('focusbeats_target_end_time');
      localStorage.removeItem('focusbeats_time_left');
      localStorage.removeItem('focusbeats_timer_is_running');
      localStorage.removeItem('focusbeats_session_type');
    }

    if (user && actualDuration > 0) {
      try {
        const result = await api.post('/sessions', {
          ...sessionMetadata,
          duration_minutes: actualDuration,
          session_type: sessionType,
          notes: stickyNote || null,
          completed: isAutoEnd
        });
        
        if (!keepActive) {
          navigate('/dashboard', { state: { showSummary: result } });
        }
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if (!keepActive) {
      navigate('/dashboard', {
        state: {
          showSummary: {
            duration_minutes: actualDuration,
            focus_score_earned: isAutoEnd ? 10 : 2,
            task_name: sessionMetadata.task_name
          }
        }
      });
      // Implementation of Phase-Aware Volume Ramping
      fadeVolume(0, 2000); // Fade out over 2 seconds
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let totalSeconds = sessionType === 'work' 
    ? (sessionMetadata.mode !== 'focused' ? 25 * 60 : sessionMetadata.duration_minutes * 60)
    : (sessionType === 'long_break' ? 15 * 60 : 5 * 60);
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden pb-4">
      
      <div className="w-full h-full flex flex-col items-center justify-center relative min-h-0">
        
        {/* Centered Watch Container */}
        <div className="flex flex-col items-center justify-center relative w-full h-full max-h-screen">
          
          {/* Internal Watch Container (Safe-scaled to prevent ANY overflow) */}
          <div className="relative flex items-center justify-center w-full max-w-[min(60vh,420px)] aspect-square mb-6">
            
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
                className={`${sessionType === 'work' ? `text-primary-500 ${isRunning ? 'animate-pulse-slow' : ''}` : (sessionType === 'long_break' ? 'text-amber-500' : 'text-info')} transition-all duration-1000 ease-linear`}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-xl">
              <div className="mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted mb-2 opacity-60">
                  {sessionMetadata.mode === 'pomodoro' ? `Pomodoro Round ${sessionMetadata.current_cycle || 1} of ${sessionMetadata.total_cycles || '?'}` : 
                   sessionMetadata.mode === 'infinity' ? `Infinity Loop ${sessionMetadata.current_cycle || 1}` : 
                   "Deep Flow Mode"}
                </p>
                <h3 className="text-2xl font-black text-text tracking-tight truncate max-w-[280px] drop-shadow-sm">
                  {sessionMetadata.task_name}
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-[84px] font-black text-text tracking-tighter tabular-nums leading-none mb-6 drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
                
                <div className="flex flex-col items-center gap-4">
                  <div className={`flex items-center gap-2 px-6 py-2 bg-bg border border-border rounded-full shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${sessionType === 'work' ? 'bg-primary-500 shadow-[0_0_8px_var(--color-primary-500)]' : 'bg-info shadow-[0_0_8px_var(--color-info)]'}`}></span>
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-text">
                      {sessionType === 'work' ? (ACTIVITY_MAP[sessionMetadata.activity_type as keyof typeof ACTIVITY_MAP]?.label || 'Concentrating') : (sessionType === 'long_break' ? 'Deep Rest' : 'Resting')}
                    </span>
                  </div>

                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 opacity-80">
                    <span className="material-symbols-rounded text-base">schedule</span>
                    Expected Finish: <span className="text-text font-black">{targetEndTime ? new Date(targetEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls - Enhanced with Skip and Extend */}
          <div className="flex items-center gap-6 z-20">
            <button
              className="w-12 h-12 rounded-full bg-surface text-text-muted border border-border flex items-center justify-center hover:bg-bg hover:text-text transition-all hover:scale-105 active:scale-95 shadow-sm"
              onClick={resetPhase}
              title="Reset Phase"
            >
              <span className="material-symbols-rounded text-xl">restart_alt</span>
            </button>

            <button
              className="w-12 h-12 rounded-full bg-surface text-text-muted border border-border flex items-center justify-center hover:bg-bg hover:text-text transition-all hover:scale-105 active:scale-95 shadow-sm"
              onClick={() => extendTime(5)}
              title="Add 5 Minutes"
            >
              <span className="material-symbols-rounded text-xl">plus_one</span>
            </button>

            <button
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 hover:scale-110 ${isRunning
                  ? 'bg-surface text-text border border-border shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                  : 'bg-primary-500 text-white shadow-2xl shadow-primary-500/40'
                }`}
              onClick={toggleTimer}
              title={isRunning ? "Pause (Space)" : "Start (Space)"}
            >
              <span className="material-symbols-rounded text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              className="w-12 h-12 rounded-full bg-surface text-text-muted border border-border flex items-center justify-center hover:bg-bg hover:text-text transition-all hover:scale-105 active:scale-95 shadow-sm"
              onClick={skipPhase}
              title="Skip Phase"
            >
              <span className="material-symbols-rounded text-xl">skip_next</span>
            </button>

            <button
              className="w-14 h-14 rounded-full bg-surface text-error border border-border flex items-center justify-center hover:bg-error hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md group"
              onClick={() => endSession(false)}
              title="End session (Esc)"
            >
              <span className="material-symbols-rounded text-3xl group-hover:rotate-90 transition-transform">stop</span>
            </button>
          </div>
        </div>
        
        {/* Now Playing - Premium Glassmorphism Card */}
        {currentTrack && (
          <div className="absolute bottom-10 left-10 max-w-[300px] z-30 animate-in slide-in-from-left-10 duration-700">
            <div className="bg-surface/30 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl group/music shadow-black/20">
              <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 relative overflow-hidden">
                {isPlaying ? (
                  <div className="flex items-end gap-[2px] h-5 mb-1">
                    <div className="w-[3px] bg-primary-500 animate-[music-bar_0.6s_ease-in-out_infinite] h-2"></div>
                    <div className="w-[3px] bg-primary-500 animate-[music-bar_0.8s_ease-in-out_infinite] h-5"></div>
                    <div className="w-[3px] bg-primary-500 animate-[music-bar_0.7s_ease-in-out_infinite] h-3"></div>
                    <div className="w-[3px] bg-primary-500 animate-[music-bar_0.9s_ease-in-out_infinite] h-4"></div>
                  </div>
                ) : (
                  <span className="material-symbols-rounded text-primary-500 text-2xl opacity-60">music_note</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-0.5 opacity-80">
                  {currentTrack.station || 'Focus Station'}
                </span>
                <h4 className="text-sm font-black text-text truncate leading-tight group-hover/music:text-primary-500 transition-colors">
                  {currentTrack.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-primary-500 animate-pulse' : 'bg-text-muted'}`}></span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {isPlaying ? 'Flowing' : 'Paused'}
                  </span>
                </div>
              </div>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center text-text hover:bg-primary-500 hover:text-white transition-all active:scale-90"
              >
                <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Constraints-Friendly Static Aura Background */}
      <div className="absolute inset-x-0 bottom-0 h-[70vh] pointer-events-none z-0 overflow-hidden select-none">
        <img 
          src="/assets/images/focus-aura.png" 
          alt="" 
          className={`w-full h-full object-cover object-top opacity-30 transition-all duration-1000 ${
            isPlaying ? 'scale-110 blur-sm' : 'scale-100 blur-md'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      {showCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-[2px] animate-in fade-in duration-1000"></div>
          <div className="relative animate-in zoom-in spin-in duration-700 flex flex-col items-center">
             <div className="w-64 h-64 bg-primary-500 rounded-full blur-[100px] absolute opacity-50 scale-150 animate-pulse"></div>
             <span className="material-symbols-rounded text-[180px] text-primary-500 drop-shadow-[0_0_30px_var(--color-primary-500)] animate-bounce">emoji_events</span>
             <h2 className="text-5xl font-black text-white mt-8 tracking-tighter drop-shadow-lg">GOAL ACHIEVED!</h2>
             <p className="text-primary-200 font-bold uppercase tracking-[0.4em] mt-4">Long Break Unlocked</p>
          </div>
          {/* Simple CSS Snowflakes as Confetti */}
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
