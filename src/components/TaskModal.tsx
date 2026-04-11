import { useState, useEffect } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; priority: string; due_date: string | null }) => void;
  initialData?: any;
}

export function TaskModal({ isOpen, onClose, onSubmit, initialData }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPriority(initialData.priority || 'medium');
      setDueDate(initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setPriority('medium');
      setDueDate('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/85 backdrop-blur-xl animate-in fade-in duration-500">
      <div 
        className="bg-surface border border-border/50 rounded-[40px] shadow-premium overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="p-10 relative">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/80">Command Directive</span>
              </div>
              <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                {initialData ? 'Update Intel' : 'New Mission'}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-bg hover:bg-border/30 rounded-full transition-all text-text-muted hover:text-text border border-border/40"
            >
              <span className="material-symbols-rounded text-xl">close</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Title Section */}
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 group-focus-within:text-primary-500 transition-colors">
                <span className="material-symbols-rounded text-sm">edit_note</span>
                Objective
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Name your mission..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-0 bg-transparent border-none text-2xl font-black text-text placeholder:text-text-muted/30 focus:ring-0 outline-none transition-all selection:bg-primary-500/20"
              />
              <div className="h-px w-full bg-border mt-3 group-focus-within:bg-primary-500 transition-colors"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Priority Section */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  <span className="material-symbols-rounded text-sm uppercase">priority_high</span>
                  Urgency Level
                </label>
                <div className="flex bg-bg p-1.5 rounded-2xl border border-border/60">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      type="button"
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                        priority === p 
                          ? 'bg-surface text-text shadow-sm border border-border/40' 
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date Section */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  <span className="material-symbols-rounded text-sm">event</span>
                  Deadline
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-bg border border-border/60 rounded-2xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all font-bold text-text text-sm outline-none appearance-none"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-text-muted/60 pointer-events-none text-xl">calendar_today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center gap-4">
            <button
              onClick={onClose}
              type="button"
              className="px-8 py-4 font-black text-text-muted hover:text-text transition-all text-xs uppercase tracking-widest border border-transparent hover:border-border rounded-2xl"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ title, priority, due_date: dueDate || null })}
              disabled={!title}
              type="button"
              className="flex-1 py-4 bg-text text-bg dark:bg-primary-500 dark:text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
            >
              <span>{initialData ? 'Finalize Changes' : 'Execute Mission'}</span>
              <span className="material-symbols-rounded text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

