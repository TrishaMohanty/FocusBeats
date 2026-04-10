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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-[32px] shadow-premium overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-text tracking-tight">
              {initialData ? 'Edit Mission' : 'Draft New Mission'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Title</label>
              <input
                type="text"
                autoFocus
                placeholder="What's the primary objective?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg border border-border rounded-2xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-bold text-text outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Priority</label>
                <div className="flex bg-bg p-1 rounded-xl border border-border">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        priority === p 
                          ? 'bg-surface text-text shadow-sm' 
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl focus:border-primary-500 transition-all font-bold text-text text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 font-black text-text-muted hover:text-text transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ title, priority, due_date: dueDate || null })}
              disabled={!title}
              className="flex-1 py-4 bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale text-sm"
            >
              {initialData ? 'Update Mission' : 'Confirm Mission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
