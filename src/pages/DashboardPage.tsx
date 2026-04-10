import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionSummaryModal } from '../components/SessionSummaryModal';
import { QuickPickBar } from '../components/presets/QuickPickBar';
import { useSession } from '../contexts/SessionContext';
import { ACTIVITY_MAP } from '../lib/constants/activities';

export function DashboardPage() {
  const { user } = useAuth();
  const { openSessionModal } = useSession();
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
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
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

      api.get('/tasks')
        .then(data => setActiveMissions(data.filter((t: any) => !t.completed).slice(0, 3)))
        .catch(console.error);
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-rounded animate-spin text-primary-500 text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SessionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          window.history.replaceState({}, document.title);
        }}
        summaryData={summaryPayload}
      />

      {/* Top Action Quickbar - Redesigned as Compact 'Quick Pick' */}
      <QuickPickBar />

      {/* Resume Session Banner (If active) */}
      {activeSession && (
        <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl flex items-center justify-between shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20">
              <span className="material-symbols-rounded block">motion_photos_on</span>
            </div>
            <div>
              <h3 className="font-extrabold text-text tracking-tight">Active Session</h3>
              <p className="text-text-muted text-sm leading-none mt-1">
                Flowing with <span className="text-primary-500 font-bold">{ACTIVITY_MAP[activeSession.activity_type as keyof typeof ACTIVITY_MAP]?.label || activeSession.activity_type}</span>
                {activeSession.mode === 'pomodoro' && (
                  <>
                    <span className="mx-2 text-border">•</span>
                    <span className="text-amber-500 font-bold">Round {activeSession.current_cycle || 1} of {activeSession.total_cycles || '?'}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/timer')}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary-500/20"
          >
            Return to Flow
          </button>
        </div>
      )}

      {/* Primary Highlight: Focus Score & Key Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Focus Score Hero (2/3 width) */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-[32px] p-8 relative overflow-hidden group hover:border-primary-500/40 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary-500/10 transition-colors" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Stability Index</p>
              </div>
              <h2 className="text-5xl font-black text-text tracking-tighter mb-4">
                Deep Focus <span className="text-primary-500">Score</span>
              </h2>
              <p className="text-lg text-text-muted  leading-relaxed">
                Your cognitive endurance is up by <span className="text-success font-bold">12%</span> compared to last week. Keep it up!
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border/40" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (stats.focusScore / 100) * 552.92} strokeLinecap="round" className="text-primary-500 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-text tracking-tighter">{stats.focusScore}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Mental Energy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Stats Grid (1/3 width) */}
        <div className="lg:col-span-4 grid grid-rows-3 gap-4">
          {[
            { label: 'Sessions', value: stats.sessionsToday, icon: 'schedule', color: 'text-info', bg: 'bg-info/10' },
            { label: 'Tasks', value: stats.tasksCompleted, icon: 'check_circle', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Streak', value: `${stats.streakDays} Days`, icon: 'local_fire_department', color: 'text-warning', bg: 'bg-warning/10' }
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border p-5 rounded-3xl flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">{stat.label}</p>
                <p className="text-2xl font-black text-text">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Content: Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Missions (Integrated Task List) */}
          <section className="bg-surface border border-border rounded-3xl p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h3 className="text-xl font-bold text-text">Active Missions</h3>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm font-bold text-text-muted hover:text-primary-500 transition-colors"
              >
                Board Mission Control
              </button>
            </div>

            <div className="space-y-3">
              {activeMissions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-text-muted bg-bg/30 rounded-2xl border border-dashed border-border group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <p className="text-sm font-bold relative z-10">No missions drafted yet.</p>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="mt-4 px-6 py-2 bg-text text-bg rounded-xl font-black text-xs relative z-10 hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Draft Mission
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                   {activeMissions.map((task: any) => (
                     <div key={task._id} className="p-3 bg-bg border border-border rounded-2xl flex items-center justify-between group hover:border-primary-500/30 transition-all">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                           <p className="text-sm font-bold text-text truncate max-w-[140px] md:max-w-none">{task.title}</p>
                        </div>
                        <button 
                          onClick={() => openSessionModal({ 
                            task_name: task.title,
                            task_id: task._id
                          })}
                          className="p-2 bg-primary-500/10 text-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:text-white"
                        >
                           <span className="material-symbols-rounded text-lg">play_arrow</span>
                        </button>
                     </div>
                   ))}
                   <button 
                     onClick={() => navigate('/tasks')}
                     className="w-full py-3 bg-bg border border-border rounded-2xl text-text-muted hover:text-primary-500 hover:border-primary-500/30 transition-all font-bold text-sm flex items-center justify-center gap-2"
                   >
                     <span className="material-symbols-rounded text-sm">list_alt</span>
                     Board Mission Control
                   </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity List */}
          <section className="bg-surface border border-border rounded-3xl p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">Recent Flow</h3>
              <button
                onClick={() => navigate('/analytics')}
                className="text-sm font-bold text-text-muted hover:text-primary-500 transition-colors"
              >
                Intelligence Report
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentSessions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-text-muted bg-bg/50 rounded-2xl border border-dashed border-border group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="material-symbols-rounded text-5xl mb-4 opacity-50 relative z-10 group-hover:scale-110 transition-transform">history_toggle_off</span>
                  <h4 className="text-lg font-bold text-text mb-1 relative z-10">No Flow Detected</h4>
                  <p className="text-sm mb-6 relative z-10">Your journey starts with a single session.</p>
                  <button
                    onClick={() => openSessionModal()}
                    className="flex items-center gap-2 px-6 py-2 bg-text text-bg rounded-xl font-black text-sm relative z-10 hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    <span className="material-symbols-rounded text-[18px]">play_arrow</span>
                    Start Now
                  </button>
                </div>
              ) : (
                stats.recentSessions.map((session: any) => (
                  <div key={session._id} className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border hover:border-primary-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-surface rounded-xl shadow-sm border border-border">
                        <span className="material-symbols-rounded text-text-muted block">
                          {ACTIVITY_MAP[session.activity_type as keyof typeof ACTIVITY_MAP]?.icon || 'rocket_launch'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-text">{session.task_name || 'Deep Work Session'}</p>
                        <div className="flex items-center gap-2 text-sm text-text-muted mt-0.5">
                          <span className="capitalize">{ACTIVITY_MAP[session.activity_type as keyof typeof ACTIVITY_MAP]?.label || session.activity_type}</span>
                          <span>•</span>
                          <span>{new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary-600 dark:text-primary-400 text-lg">{session.duration_minutes}m</p>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Duration</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Motivation Insight Card (Redesigned) */}
          <section className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
            <div className="absolute -right-4 -top-4 text-primary-400/20 group-hover:rotate-12 transition-transform duration-700">
              <span className="material-symbols-rounded text-[120px] block" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-100 mb-4">Mindset</p>
              <p className="text-lg font-bold leading-relaxed italic mb-6">
                "Small steps every day lead to big results over time."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <span className="material-symbols-rounded text-sm block">bolt</span>
                </div>
                <p className="font-extrabold text-xs tracking-wider">Stay Consistent</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
