import { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { AuraVisualizer } from '../components/audio/AuraVisualizer';
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

  const { playTrack, currentTrack, isPlaying, togglePlay, fadeVolume } = useAudio();
  const [sessionMetadata, setSessionMetadata] = useState<any>(getInitialSession());
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>(() => {
    const saved = localStorage.getItem('focusbeats_session_type');
    return (saved as any) || 'work';
  });

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

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('focusbeats_timer_is_running');
    return saved === null ? true : saved === 'true';
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('focusbeats_target_end_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const [upcomingTracks, setUpcomingTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [stickyNote, setStickyNote] = useState(() => {
    return localStorage.getItem('focusbeats_timer_note') || "";
  });

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
    setLoadingTracks(true);
    const { activity_type, focus_level } = sessionMetadata;
    
    api.get(`/music?activity_type=${activity_type}&focus_level=${focus_level}`)
      .then(data => {
        const tracksWithMatch = data.map((t: any) => ({
          ...t,
          match: Math.floor(Math.random() * (99 - 80 + 1)) + 80
        })).sort((a: any, b: any) => b.match - a.match);
        setUpcomingTracks(tracksWithMatch);
      })
      .catch(console.error)
      .finally(() => setLoadingTracks(false));
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
          duration_minutes: actualDuration,
          session_type: sessionType,
          activity_type: sessionMetadata.activity_type,
          focus_level: sessionMetadata.focus_level,
          task_name: sessionMetadata.task_name,
          task_id: sessionMetadata.task_id,
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
    <div className="h-[calc(100vh-theme(spacing.20)-112px)] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden px-8">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-xl h-full items-center min-h-0">
        
        {/* Left: The Watch (col-span-12 on mobile, col-span-8 on desktop) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative">
          
          {/* Internal Watch Container (Squeezed for standard viewports) */}
          <div className="relative flex items-center justify-center w-full max-w-[min(50vh,360px)] aspect-square mb-4">
            
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
                <span className="text-[72px] font-black text-text tracking-tighter tabular-nums leading-none mb-4 drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-1.5 bg-bg border border-border rounded-full shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${sessionType === 'work' ? 'bg-primary-500 shadow-[0_0_8px_var(--color-primary-500)]' : 'bg-info shadow-[0_0_8px_var(--color-info)]'}`}></span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
                      {sessionType === 'work' ? (ACTIVITY_MAP[sessionMetadata.activity_type as keyof typeof ACTIVITY_MAP]?.label || 'Concentrating') : (sessionType === 'long_break' ? 'Deep Rest' : 'Resting')}
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

        {/* Right Panel: Sticky Note + Scrollable Queue */}
        <div className="hidden lg:flex lg:col-span-4 flex-col h-full pt-1 pb-12 gap-6 overflow-hidden">
          
          {/* Layer 1: Sticky Note (Fixed at top of panel) */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Sticky Note</h4>
              <span className="material-symbols-rounded text-base text-amber-400">push_pin</span>
            </div>
            <div className="bg-amber-100/40 dark:bg-amber-900/20 border border-amber-300/40 dark:border-amber-800/40 p-5 rounded-3xl shadow-sm relative group transition-all hover:shadow-md">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-rounded text-base text-amber-900 dark:text-amber-100">edit_note</span>
              </div>
              <p className="text-[10px] font-black text-amber-900/80 dark:text-amber-200 uppercase tracking-[0.2em] mb-3">Goal Objective</p>
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-[15px] font-bold text-amber-950 dark:text-amber-50 resize-none placeholder:text-amber-900/25 dark:placeholder:text-amber-200/20 leading-relaxed no-scrollbar"
                placeholder="Write your session focus here..."
                rows={3}
                value={stickyNote}
                onChange={(e) => setStickyNote(e.target.value)}
              />
            </div>
          </div>

          {/* Layer 2: Smart Queue (Scrollable) */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Audio Queue</h4>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 no-scrollbar space-y-4 pb-20 relative">
              {loadingTracks ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-rounded animate-spin text-primary-500 text-3xl">refresh</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Loading Tracks...</p>
                </div>
              ) : upcomingTracks.map((track) => (
                <div 
                  key={track._id} 
                  onClick={() => playTrack(track)}
                  className={`bg-surface border p-4 rounded-2xl shadow-sm transition-all group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-4 ${
                    currentTrack?._id === track._id ? 'border-primary-500 ring-4 ring-primary-500/5' : 'border-border hover:border-primary-400/50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-inner overflow-hidden relative ${
                    currentTrack?._id === track._id && isPlaying ? 'bg-primary-500 text-white' : 'bg-bg text-text-muted group-hover:bg-primary-500 group-hover:text-white'
                  }`}>
                    {currentTrack?._id === track._id && isPlaying ? (
                       <div className="flex items-end gap-[2px] h-4">
                          <div className="w-1 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-2"></div>
                          <div className="w-1 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-4"></div>
                          <div className="w-1 bg-white animate-[music-bar_0.7s_ease-in-out_infinite] h-3"></div>
                       </div>
                    ) : (
                      <span className="material-symbols-rounded text-3xl">
                        graphic_eq
                      </span>
                    )}
                    <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-black text-text text-[15px] truncate group-hover:text-primary-500 transition-colors">
                        {track.title}
                      </h5>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-text-muted truncate uppercase tracking-widest">{track.category}</p>
                      <div className="w-16 h-1 bg-bg rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${track.match}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-5 border-2 border-dashed border-border rounded-2xl text-[11px] font-black text-text-muted hover:border-primary-500/50 hover:text-primary-500 transition-all flex items-center justify-center gap-2 group">
                <span className="material-symbols-rounded text-lg group-hover:rotate-180 transition-transform">refresh</span>
                Regenerate Recommendations
              </button>
            </div>

            {/* Bottom Blur Mask (Indicates more scroll) */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none z-10 backdrop-blur-[2px] opacity-90"></div>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] blur-[160px] rounded-full pointer-events-none transition-all duration-1000 ${
        isPlaying ? 'opacity-30 scale-110' : 'opacity-10 scale-100'
      } ${sessionType === 'work' ? 'bg-primary-500 animate-pulse-slow' : (sessionType === 'long_break' ? 'bg-amber-500' : 'bg-info')}`}></div>

      <div className="absolute inset-0 pointer-events-none z-0">
         <AuraVisualizer color={sessionType === 'work' ? '#10b981' : (sessionType === 'long_break' ? '#f59e0b' : '#3b82f6')} />
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
