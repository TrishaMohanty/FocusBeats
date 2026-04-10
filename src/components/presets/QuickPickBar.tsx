import { useSession } from '../../contexts/SessionContext';
import type { SessionPreset } from '../../types/session';

const QUICK_PRESETS: SessionPreset[] = [
  { id: 'deep_code', label: 'Deep Code', icon: 'terminal', color: 'primary', activity: 'coding', duration: 0, level: 'high', isInfinity: true },
  { id: 'bug_hunt', label: 'Bug Hunt', icon: 'bug_report', color: 'rose', activity: 'debugging', duration: 45, level: 'high' },
  { id: 'refactor', label: 'Refactor', icon: 'rebase_edit', color: 'info', activity: 'refactoring', duration: 60, level: 'high' },
  { id: 'doc_write', label: 'Doc Write', icon: 'description', color: 'success', activity: 'documentation', duration: 30, level: 'low' },
  { id: 'brainstorm', label: 'Brainstorm', icon: 'lightbulb', color: 'warning', activity: 'brainstorming', duration: 45, level: 'medium' },
  { id: 'final_test', label: 'Final Test', icon: 'contract_edit', color: 'primary', activity: 'testing', duration: 30, level: 'high' },
  { id: 'quick_read', label: 'Quick Read', icon: 'book_4', color: 'info', activity: 'reading', duration: 25, level: 'medium' },
  { id: 'night_flow', label: 'Night Flow', icon: 'nightlight', color: 'info', activity: 'night_study', duration: 0, level: 'low', isInfinity: true },
];

export function QuickPickBar() {
  const { openSessionModal } = useSession();

  const handleQuickPick = (preset: SessionPreset) => {
    openSessionModal({
      activity_type: preset.activity,
      focus_level: preset.level,
      task_name: preset.label,
      duration_minutes: preset.duration,
      is_infinity: preset.isInfinity || false,
      session_type: 'work'
    });
  };

  return (
    <section className="flex items-center gap-6 py-2 border-b border-border/30 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-2 pr-6 border-r border-border/40 hidden sm:flex">
        <span className="material-symbols-rounded text-primary-500 text-sm">bolt</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">Quick Pick</span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mb-1 scroll-smooth px-2">
        {QUICK_PRESETS.map((item) => (
          <button 
            key={item.id} 
            onClick={() => handleQuickPick(item)}
            className={`group flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/60 rounded-full transition-all duration-300 hover:border-${item.color}-500 hover:bg-${item.color}-500/5 active:scale-95 whitespace-nowrap shadow-sm shadow-black/5 hover:shadow-md hover:shadow-${item.color}-500/10 flex-shrink-0`}
          >
            <span className={`material-symbols-rounded text-[20px] text-${item.color}-500 group-hover:scale-110 transition-transform`}>{item.icon}</span>
            <span className="font-bold text-text text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
