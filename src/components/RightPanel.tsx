import { useState, useEffect } from 'react';
import { useLayout } from '../contexts/LayoutContext';

export function RightPanel() {
  const { activeTaskName } = useLayout();
  const [note, setNote] = useState(() => {
    return localStorage.getItem('focusbeats_timer_note') || '';
  });

  useEffect(() => {
    localStorage.setItem('focusbeats_timer_note', note);
  }, [note]);

  return (
    <aside className="grid-area-right bg-surface border-l border-border flex flex-col p-6 gap-6 h-full overflow-hidden">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Active Mission</p>
        <h3 className="text-xl font-black text-text leading-tight tracking-tight">
          {activeTaskName || 'No Active Task'}
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between text-text-muted">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Session Notes</p>
          <span className="material-symbols-rounded text-base">edit_note</span>
        </div>
        
        <div className="flex-1 bg-bg/50 border border-border rounded-2xl p-4 relative group transition-all hover:border-primary-500/30">
          <textarea
            className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-text placeholder:text-text-muted/40 resize-none leading-relaxed no-scrollbar"
            placeholder="Jot down quick thoughts, links, or sub-tasks for this session..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-300"></div>
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
         <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-500 text-white rounded-lg">
               <span className="material-symbols-rounded text-lg">lightbulb</span>
            </div>
            <div>
               <p className="text-xs font-bold text-text">Pro Tip</p>
               <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">Focus works best in 25m chunks. Your notes are saved automatically.</p>
            </div>
         </div>
      </div>
    </aside>
  );
}
