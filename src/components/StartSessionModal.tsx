import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (sessionData: any) => void;
}

export function StartSessionModal({ isOpen, onClose, onStart }: StartSessionModalProps) {
  const { user } = useAuth();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-surface w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-outline animate-in fade-in zoom-in duration-300">
        <div className="p-10 space-y-8">
          <div className="text-center">
             <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-2">New Entry</p>
             <h3 className="text-4xl font-black tracking-tighter">Start Session</h3>
             <p className="text-sm text-on-surface-muted mt-2">Configure your daily flow and find your focus.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block text-[10px] uppercase font-bold text-on-surface-muted tracking-widest mb-2 px-2">Current Activity</label>
               <select 
                 value={activity}
                 onChange={(e) => setActivity(e.target.value)}
                 className="w-full bg-surface-low border border-outline rounded-2xl py-4 px-6 font-bold text-on-surface focus:ring-1 focus:ring-primary/20 appearance-none outline-none"
               >
                 <option value="reading">📖 Reading</option>
                 <option value="coding">💻 Coding</option>
                 <option value="revision">📝 Revision</option>
                 <option value="problem_solving">🧩 Problem Solving</option>
                 <option value="night_study">🌙 Night Study</option>
               </select>
            </div>

            <div>
               <label className="block text-[10px] uppercase font-bold text-on-surface-muted tracking-widest mb-2 px-2">Focus Intensity</label>
               <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFocusLevel(level)}
                      className={`py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                        focusLevel === level 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-surface-low text-on-surface-muted border border-outline hover:bg-surface-high'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="block text-[10px] uppercase font-bold text-on-surface-muted tracking-widest mb-2 px-2">Duration ⏱️</label>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${
                        duration === dur.value 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-surface-low text-on-surface-muted border border-outline hover:bg-surface-high'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 px-2">Primary Task</label>
               <input 
                 type="text"
                 placeholder="What are you working on?"
                 value={taskName}
                 onChange={(e) => setTaskName(e.target.value)}
                 className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-300"
               />
            </div>

            <button
               type="submit"
               className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white rounded-[24px] font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform mt-4"
            >
              Launch Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
