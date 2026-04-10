import React, { useState, useEffect } from 'react';
import { ACTIVITIES } from '../lib/constants/activities';
import { useSession } from '../contexts/SessionContext';
import type { ActivityId, FocusLevel, SessionMode } from '../types/session';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (sessionData: any) => void;
}

export function StartSessionModal({ isOpen, onClose, onStart }: StartSessionModalProps) {
  const { initialSessionData, activeSession, autoSaveCurrentSession } = useSession();
  const [activity, setActivity] = useState<ActivityId>('coding');
  const [focusLevel, setFocusLevel] = useState<FocusLevel>('medium');
  const [mode, setMode] = useState<SessionMode>('focused');
  const [duration, setDuration] = useState<number>(25);
  const [taskName, setTaskName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActivity(initialSessionData?.activity_type || 'coding');
      setFocusLevel(initialSessionData?.focus_level || 'medium');
      setMode(initialSessionData?.mode || (initialSessionData?.is_infinity ? 'infinity' : 'focused'));
      setDuration(initialSessionData?.duration_minutes || 25);
      setTaskName(initialSessionData?.task_name || '');
    }
  }, [isOpen, initialSessionData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (activeSession) {
        await autoSaveCurrentSession();
      }

      const sessionData = {
        activity_type: activity,
        focus_level: focusLevel,
        task_name: taskName,
        duration_minutes: duration,
        total_goal_minutes: duration,
        is_infinity: mode === 'infinity',
        mode: mode,
        session_type: 'work' as const,
        current_cycle: mode !== 'focused' ? 1 : undefined,
        total_cycles: mode === 'pomodoro' ? Math.max(1, Math.floor(duration / 25)) : undefined
      };

      onStart(sessionData);
      onClose();
    } catch (e) {
      console.error("Failed to start session:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md sm:p-lg">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-surface border border-border w-full max-w-3xl rounded-[2rem] shadow-[0_8px_48px_-8px_rgba(0,0,0,0.3)] relative z-10 animate-in zoom-in-95 fade-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-xl overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1">New Entry</p>
            <h3 className="text-3xl font-extrabold text-text tracking-tight">Start Session</h3>
            <p className="text-text-muted mt-2">Configure your daily flow and find your focus.</p>
            
            {activeSession && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-rounded text-amber-500 mt-0.5">warning</span>
                <div className="text-sm">
                  <p className="font-bold text-amber-600 dark:text-amber-400">Active Flow Detected</p>
                  <p className="text-amber-600/80 dark:text-amber-400/80">Launching this will auto-save your current progress with "{activeSession.task_name}".</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-xl">
            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">Current Activity</label>
              <div className="relative">
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityId)}
                  className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow shadow-sm cursor-pointer"
                >
                  {ACTIVITIES.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">Focus Intensity</label>
              <div className="grid grid-cols-3 gap-sm">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFocusLevel(level as FocusLevel)}
                    className={`py-3 rounded-xl font-bold text-sm capitalize transition-all border ${focusLevel === level
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 border-primary-500 shadow-sm'
                        : 'bg-bg text-text-muted border-border hover:bg-surface hover:border-text-muted/30 hover:text-text'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">Session Mode</label>
              <div className="grid grid-cols-3 gap-sm">
                {(['focused', 'pomodoro', 'infinity'] as SessionMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl font-bold text-sm capitalize transition-all border ${mode === m
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 border-primary-500 shadow-sm'
                        : 'bg-bg text-text-muted border-border hover:bg-surface hover:border-text-muted/30 hover:text-text'
                      }`}
                  >
                    <span className="material-symbols-rounded text-[20px]">
                      {m === 'focused' ? 'target' : m === 'pomodoro' ? 'timer_10_alt_1' : 'all_inclusive'}
                    </span>
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-muted px-1 font-medium">
                {mode === 'focused' ? "Standard single session block." : 
                 mode === 'pomodoro' ? "25m focus + 5m breaks. Best for long goals." : 
                 "Continuous 25/5 intervals until you decide to stop."}
              </p>
            </div>

            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">
                {mode === 'infinity' ? 'Interval Duration' : 'Time Goal ⏱️'}
              </label>
              <div className="grid grid-cols-5 gap-xs sm:gap-sm">
                {[25, 60, 120, 180, 240].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDuration(val)}
                    className={`py-2 rounded-xl font-bold text-sm transition-all border ${duration === val
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 border-primary-500 shadow-sm'
                        : 'bg-bg text-text-muted border-border hover:bg-surface hover:border-text-muted/30 hover:text-text'
                      }`}
                  >
                    {val >= 60 ? `${val/60}h` : `${val}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">Primary Task</label>
              <input
                type="text"
                placeholder="What are you working on?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow shadow-sm font-medium"
              />
            </div>

            <div className="pt-sm">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-lg tracking-tight shadow-md shadow-primary-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                   <span className="material-symbols-rounded animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-rounded">rocket_launch</span>
                )}
                {isSaving ? 'Syncing...' : 'Launch Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
