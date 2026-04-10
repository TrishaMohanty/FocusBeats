import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Current task loading logic placeholder
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-lg border-b border-border pb-md">
        <div className="flex flex-col gap-xs">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Management</p>
          <h2 className="text-4xl font-extrabold text-text tracking-tight">Active Tasks</h2>
        </div>
        <button
          onClick={() => {
            if (!user) navigate('/login');
          }}
          className="px-md py-sm bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm shadow-primary-500/20"
        >
          <span className="material-symbols-rounded text-lg">add</span>
          Add Task
        </button>
      </div>

      {!user ? (
        <div className="bg-surface border-2 border-border/60 p-16 rounded-[40px] shadow-glass flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-warning/10 text-warning rounded-3xl flex items-center justify-center mb-8 border border-warning/20">
            <span className="material-symbols-rounded text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
          </div>
          <h3 className="text-3xl font-black text-text mb-3 tracking-tight">Sync Across Devices</h3>
          <p className="text-text-muted font-bold mb-10 max-w-sm leading-relaxed">Login to FocusBeats to manage your complex task workflows and sync them everywhere.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-4 bg-text text-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bg/10"
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           {/* Left: Actionable Empty State */}
           <div className="md:col-span-8 bg-surface border-2 border-dashed border-border/60 p-16 rounded-[40px] flex flex-col items-center justify-center text-center animate-in slide-in-from-left-4 duration-700 group hover:border-primary-500/30 transition-colors">
              <div className="w-20 h-20 bg-bg text-text-muted rounded-3xl flex items-center justify-center border border-border/60 mb-8 group-hover:rotate-12 transition-transform">
                <span className="material-symbols-rounded text-4xl">inventory_2</span>
              </div>
              <h3 className="text-2xl font-black text-text mb-2 tracking-tight">No Active Missions</h3>
              <p className="text-text-muted font-bold mb-8">Your task board is clear. Time to draft a new mission or take a well-deserved break.</p>
              <button 
                onClick={() => {}} // This would open the task creation modal/view
                className="px-8 py-3 bg-primary-500 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
              >
                <span className="material-symbols-rounded text-xl">add</span>
                Draft First Mission
              </button>
           </div>
           
           {/* Right: Quick Recs */}
           <div className="md:col-span-4 space-y-6">
              <div className="bg-text text-bg p-8 rounded-[40px] shadow-premium relative overflow-hidden group animate-in slide-in-from-right-4 duration-700">
                 <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Recommendation</p>
                 <h4 className="text-xl font-black mb-4 leading-tight tracking-tight">Ready for takeoff?</h4>
                 <p className="text-bg/60 text-sm font-bold mb-8 italic leading-relaxed">"Focus on being productive instead of busy."</p>
                 <button 
                   onClick={() => navigate('/timer')}
                   className="w-full py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-400 transition-all btn-press shadow-lg shadow-primary-500/20"
                 >
                   Start Deep Session
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
