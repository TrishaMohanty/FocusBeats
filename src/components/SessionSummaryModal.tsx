
interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: any;
}

export function SessionSummaryModal({ isOpen, onClose, summaryData }: SessionSummaryModalProps) {
  if (!isOpen || !summaryData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-surface border border-border w-full  rounded-[2rem] p-xl flex flex-col items-center text-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 fade-in duration-300">

        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-3xl flex items-center justify-center mb-md border border-primary-200 dark:border-primary-800 shadow-sm shadow-primary-500/10">
          <span className="material-symbols-rounded text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-2">Session Complete</p>
        <h3 className="text-4xl font-extrabold text-text tracking-tight mb-lg">Great Work!</h3>

        <div className="flex w-full gap-sm mb-lg">
          <div className="flex-1 bg-bg border border-border p-md rounded-2xl">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Time Studied</p>
            <p className="text-3xl font-black text-text">{summaryData.duration_minutes}<span className="text-lg text-text-muted ml-0.5">m</span></p>
          </div>
          <div className="flex-1 bg-bg border border-border p-md rounded-2xl">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Focus Score</p>
            <p className="text-3xl font-black text-primary-500">+{summaryData.focus_score_earned}</p>
          </div>
        </div>

        <div className="w-full bg-bg border border-border p-md rounded-2xl mb-xl text-left border-dashed">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Task Addressed</p>
          <p className="text-lg font-bold text-text">{summaryData.task_name || 'Deep Work Flow'}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-bg text-text hover:bg-surface border-2 border-border hover:border-primary-300 rounded-xl font-bold transition-colors"
        >
          Return to Dashboard
        </button>

      </div>
    </div>
  );
}
