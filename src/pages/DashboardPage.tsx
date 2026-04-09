import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionSummaryModal } from '../components/SessionSummaryModal';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    focusScore: 0,
    sessionsToday: 0,
    tasksCompleted: 0,
    streakDays: 0,
    recentSessions: []
  });
  const [activeSession, setActiveSession] = useState<any>(null);
  const isFetched = useRef(false);
  
  const location = useLocation();
  const summaryPayload = location.state?.showSummary;
  const [showSummaryModal, setShowSummaryModal] = useState(!!summaryPayload);

  useEffect(() => {
    const saved = localStorage.getItem('focusbeats_active_session');
    if (saved) {
      try {
        setActiveSession(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved session", e);
      }
    }
    if (user && !isFetched.current) {
      isFetched.current = true;
      api.get('/dashboard')
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!user) {
        setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin text-primary">
                <span className="material-symbols-outlined text-4xl">refresh</span>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Welcome Section */}
      <SessionSummaryModal 
          isOpen={showSummaryModal} 
          onClose={() => {
              setShowSummaryModal(false);
              // Clean history state so refresh doesn't pop it again
              window.history.replaceState({}, document.title);
          }} 
          summaryData={summaryPayload} 
      />

      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-1">Overview</p>
          <h2 className="text-5xl font-black tracking-tighter">
            {user ? `Hello, ${user.display_name || user.email.split('@')[0]}` : 'Welcome, Guest'}
          </h2>
          <p className="text-on-surface-muted font-medium mt-2">Ready to find your focus? Here's your metrics for today.</p>
        </div>
      </section>

      {/* Resume Session Banner */}
      {activeSession && (
        <div className="bg-primary-container text-on-primary-container p-6 rounded-[24px] shadow-lg flex items-center justify-between animate-in slide-in-from-top border border-primary/20">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined text-white text-3xl">motion_photos_on</span>
             </div>
             <div>
                <h3 className="font-black text-xl text-white">Active Session Detected</h3>
                <p className="text-white/80 font-bold text-sm">You have an ongoing {activeSession.activity_type} session.</p>
             </div>
          </div>
          <button 
             onClick={() => navigate('/timer')}
             className="px-8 py-3 bg-white text-primary rounded-xl font-black shadow-sm hover:scale-105 transition-transform"
          >
             Resume Session
          </button>
        </div>
      )}

      {/* Stats Cards - Matching Editorial Mockup Style */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-8 rounded-[32px] border border-outline relative group hover:border-primary/20 transition-colors">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <p className="text-on-surface-muted text-[10px] font-black uppercase tracking-widest">Focus Score</p>
          <p className="text-4xl font-black mt-1 tracking-tighter">{stats.focusScore}</p>
        </div>

        <div className="bg-surface p-8 rounded-[32px] border border-outline relative group hover:border-emerald-500/20 transition-colors">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          </div>
          <p className="text-on-surface-muted text-[10px] font-black uppercase tracking-widest">Sessions</p>
          <p className="text-4xl font-black mt-1 tracking-tighter">{stats.sessionsToday}</p>
        </div>

        <div className="bg-surface p-8 rounded-[32px] border border-outline relative group hover:border-blue-500/20 transition-colors">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <p className="text-on-surface-muted text-[10px] font-black uppercase tracking-widest">Tasks</p>
          <p className="text-4xl font-black mt-1 tracking-tighter">{stats.tasksCompleted}</p>
        </div>

        <div className="bg-[#191C1D] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 z-10 relative">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest z-10 relative">Streak</p>
          <p className="text-4xl font-black mt-1 tracking-tighter z-10 relative">{stats.streakDays} Days</p>
          <span className="material-symbols-outlined text-8xl text-white/5 absolute -right-4 -bottom-4 translate-y-4">local_fire_department</span>
        </div>
      </section>

      {/* Main Content Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity List */}
          <section className="bg-surface rounded-[40px] p-10 border border-outline">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black tracking-tighter">Recent Sessions</h3>
                <button onClick={() => navigate('/analytics')} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">View Analytics</button>
            </div>
            
            <div className="space-y-4">
              {stats.recentSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2">history</span>
                    <p className="text-sm font-bold">No sessions recorded today.</p>
                </div>
              ) : (
                stats.recentSessions.map((session: any) => (
                    <div key={session._id} className="flex items-center gap-6 p-6 hover:bg-surface-low rounded-[24px] transition-all group border border-transparent hover:border-outline">
                        <div className="w-14 h-14 bg-surface-low group-hover:bg-background rounded-[20px] flex items-center justify-center text-primary transition-colors">
                            <span className="material-symbols-outlined text-3xl">{session.activity_type === 'coding' ? 'terminal' : 'book_4'}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-black tracking-tight">{session.task_name || 'Deep Work Session'}</p>
                            <div className="flex gap-4 mt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{session.activity_type}</span>
                                <span className="text-xs font-bold text-slate-300">•</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-primary">{session.duration_minutes}m</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                        </div>
                    </div>
                ))
              )}
            </div>
          </section>

          {/* Motivation Insight Card */}
          <section className="bg-primary/5 rounded-[40px] p-10 border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                <p className="text-3xl font-black tracking-tight leading-tight max-w-xl">
                    "The way to get started is to quit talking and begin doing."
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-primary"></div>
                    <p className="text-xs font-black uppercase tracking-[.2em] text-on-surface-muted">Walt Disney</p>
                </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
            {/* Quick Controls Widget */}
            <section className="bg-surface-low rounded-[40px] p-8 border border-outline">
                <h3 className="text-xl font-black tracking-tighter mb-8">Quick Actions</h3>
                <div className="space-y-3">
                    <button 
                         onClick={() => navigate('/timer', { state: { sessionData: { activity_type: 'coding', focus_level: 'high', task_name: 'Deep Work', duration_minutes: 0, session_type: 'work', is_infinity: true } }})}
                        className="w-full flex items-center justify-between p-5 bg-primary/10 border border-primary/20 rounded-[24px] hover:bg-primary/20 transition-all font-bold text-sm text-primary group"
                    >
                        <div className="flex items-center gap-4">
                             <span className="material-symbols-outlined group-hover:scale-110 transition-transform">all_inclusive</span>
                             <div className="text-left">
                                <p>Deep Code Mode</p>
                                <p className="text-[10px] text-primary/70 uppercase">High Intensity • ∞ Infinity</p>
                             </div>
                        </div>
                        <span className="material-symbols-outlined text-primary/40 text-sm">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => navigate('/timer', { state: { sessionData: { activity_type: 'reading', focus_level: 'low', task_name: 'Light Reading', duration_minutes: 25, session_type: 'work' } }})}
                        className="w-full flex items-center justify-between p-5 bg-surface rounded-[24px] hover:translate-x-2 transition-all font-bold text-sm border border-transparent hover:border-outline shadow-xs shadow-black/5"
                    >
                        <div className="flex items-center gap-4">
                             <span className="material-symbols-outlined text-emerald-500">book_4</span>
                             <div className="text-left">
                                <p>Quick Reading</p>
                                <p className="text-[10px] text-slate-400 uppercase">Low Intensity • 25m</p>
                             </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => navigate('/tasks')}
                        className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-[24px] hover:translate-x-2 transition-all font-bold text-sm"
                    >
                        <div className="flex items-center gap-4">
                             <span className="material-symbols-outlined text-blue-500">add_task</span>
                             <span>Quick Add Task</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                    </button>
                </div>
            </section>

            {/* Upgrade/Info Card */}
            <section className="bg-gradient-to-br from-[#191C1D] to-[#2E3132] rounded-[40px] p-10 text-white relative overflow-hidden">
                 <div className="relative z-10 space-y-6">
                    <h4 className="text-2xl font-black tracking-tighter leading-tight">Master your focus with Editorial Pro.</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">Unlock deep analytics, unlimited noise profiles, and cross-device sync.</p>
                    <button className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Learn More</button>
                 </div>
                 <span className="material-symbols-outlined text-[140px] text-white/5 absolute -right-8 -bottom-8">auto_awesome</span>
            </section>
        </div>
      </div>
    </div>
  );
}
