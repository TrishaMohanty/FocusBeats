import React from 'react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: any;
}

export function SessionSummaryModal({ isOpen, onClose, summaryData }: SessionSummaryModalProps) {
  if (!isOpen || !summaryData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-surface w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-outline animate-in slide-in-from-bottom flex flex-col items-center p-12 text-center">
        
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-2">Session Complete</p>
        <h3 className="text-4xl font-black tracking-tighter mb-8">Great Work!</h3>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-surface-low rounded-[24px] p-6 border border-outline">
                <p className="text-on-surface-muted text-[10px] font-black uppercase tracking-widest mb-1">Time Studied</p>
                <p className="text-3xl font-black">{summaryData.duration_minutes}m</p>
            </div>
            <div className="bg-primary/10 rounded-[24px] p-6 border border-primary/20 text-primary">
                <p className="text-primary/70 text-[10px] font-black uppercase tracking-widest mb-1">Focus Score</p>
                <p className="text-3xl font-black">+{summaryData.focus_score_earned}</p>
            </div>
        </div>

        <div className="bg-surface-low rounded-2xl px-6 py-4 w-full mb-8 flex flex-col items-center justify-center border border-outline">
             <p className="text-[10px] uppercase font-bold text-on-surface-muted mb-1">Task Addressed</p>
             <p className="font-bold text-sm line-clamp-1">{summaryData.task_name || 'Deep Work Flow'}</p>
        </div>

        <button
            onClick={onClose}
            className="w-full py-5 bg-on-surface text-surface rounded-[24px] font-black tracking-tight text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-transform"
        >
            Return to Dashboard
        </button>

      </div>
    </div>
  );
}
