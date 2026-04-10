
import { useState } from 'react';
import { api } from '../lib/api';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: any;
}

export function SessionSummaryModal({ isOpen, onClose, summaryData }: SessionSummaryModalProps) {
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !summaryData) return null;

  const handleClose = async () => {
    if (isTaskComplete && summaryData.task_id) {
      setIsUpdating(true);
      try {
        await api.patch(`/tasks/${summaryData.task_id}`, { completed: true });
      } catch (e) {
        console.error("Failed to mark task as complete:", e);
      } finally {
        setIsUpdating(false);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="bg-surface border border-border w-full
       rounded-[2.5rem] p-xl flex flex-col items-center text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative z-10 animate-in zoom-in-95 fade-in duration-300 ring-1 ring-white/10">

        <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-3xl flex items-center justify-center mb-md border border-primary-500/20 shadow-sm shadow-primary-500/10 relative group">
          <div className="absolute inset-0 bg-primary-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
          <span className="material-symbols-rounded text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-500 mb-2">Flow Optimization Complete</p>
        <h3 className="text-4xl font-black text-text tracking-tighter mb-lg italic uppercase">Victory!</h3>

        <div className="flex w-full gap-3 mb-lg">
          <div className="flex-1 bg-bg/50 border border-border p-4 rounded-3xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Time Studied</p>
            <p className="text-2xl font-black text-text tracking-tighter">{summaryData.duration_minutes}<span className="text-sm text-text-muted ml-0.5 font-bold">m</span></p>
          </div>
          <div className="flex-1 bg-bg/50 border border-border p-4 rounded-3xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Focus Score</p>
            <p className="text-2xl font-black text-success tracking-tighter">+{summaryData.focus_score_earned}</p>
          </div>
        </div>

        <div className="w-full bg-bg/50 border border-border p-5 rounded-3xl mb-4 text-left border-dashed group transition-colors hover:border-primary-500/30">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mission Objective</p>
          <p className="text-lg font-bold text-text tracking-tight group-hover:text-primary-500 transition-colors uppercase italic">{summaryData.task_name || 'Deep Work Flow'}</p>
        </div>

        {summaryData.task_id && (
          <div className="w-full mb-8">
             <button 
               onClick={() => setIsTaskComplete(!isTaskComplete)}
               className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                 isTaskComplete ? 'bg-success/5 border-success text-success shadow-lg shadow-success/10' : 'bg-bg/30 border-border text-text-muted hover:border-primary-500/30'
               }`}
             >
                <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isTaskComplete ? 'bg-success border-success text-white' : 'border-border'}`}>
                      {isTaskComplete && <span className="material-symbols-rounded text-sm font-black">check</span>}
                   </div>
                   <span className="font-bold text-sm">Draft Mission as Finalized?</span>
                </div>
                {isTaskComplete && <span className="material-symbols-rounded animate-pulse">rocket</span>}
             </button>
          </div>
        )}

        <button
          onClick={handleClose}
          disabled={isUpdating}
          className="w-full py-5 bg-text text-bg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-text/20 tracking-tighter uppercase italic"
        >
          {isUpdating ? 'Synchronizing...' : 'Return to Home'}
        </button>

      </div>
    </div>
  );
}
