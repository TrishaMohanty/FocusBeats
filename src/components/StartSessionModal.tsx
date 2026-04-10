import React, { useState } from 'react';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (sessionData: any) => void;
}

export function StartSessionModal({ isOpen, onClose, onStart }: StartSessionModalProps) {
  const [activity, setActivity] = useState('coding');
  const [focusLevel, setFocusLevel] = useState('medium');
  const [duration, setDuration] = useState<number | 'infinity'>(25);
  const [taskName, setTaskName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const sessionData = {
      activity_type: activity,
      focus_level: focusLevel,
      task_name: taskName,
      duration_minutes: duration === 'infinity' ? 0 : duration,
      is_infinity: duration === 'infinity',
      session_type: 'work'
    };

    onStart(sessionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md sm:p-lg">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 fade-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-xl overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1">New Entry</p>
            <h3 className="text-3xl font-extrabold text-text tracking-tight">Start Session</h3>
            <p className="text-text-muted mt-2">Configure your daily flow and find your focus.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-xl">
            <div className="space-y-sm">
              <label className="block text-sm font-bold text-text">Current Activity</label>
              <div className="relative">
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow shadow-sm cursor-pointer"
                >
                  <option value="reading">📖 Reading</option>
                  <option value="coding">💻 Coding</option>
                  <option value="revision">📝 Revision</option>
                  <option value="problem_solving">🧩 Problem Solving</option>
                  <option value="night_study">🌙 Night Study</option>
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
                    onClick={() => setFocusLevel(level)}
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
              <label className="block text-sm font-bold text-text">Duration ⏱️</label>
              <div className="grid grid-cols-5 gap-xs sm:gap-sm">
                {[
                  { label: '25m', value: 25 },
                  { label: '1h', value: 60 },
                  { label: '2h', value: 120 },
                  { label: '3h', value: 180 },
                  { label: '∞', value: 'infinity' },
                ].map((dur) => (
                  <button
                    key={dur.label}
                    type="button"
                    onClick={() => setDuration(dur.value as any)}
                    className={`py-2 rounded-xl font-bold text-sm transition-all border ${duration === dur.value
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 border-primary-500 shadow-sm'
                        : 'bg-bg text-text-muted border-border hover:bg-surface hover:border-text-muted/30 hover:text-text'
                      }`}
                  >
                    {dur.label}
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
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-lg tracking-tight shadow-md shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded">rocket_launch</span>
                Launch Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
