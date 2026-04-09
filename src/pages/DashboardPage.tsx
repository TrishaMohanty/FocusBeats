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
        <span className="material-symbols-rounded animate-spin text-primary-500 text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SessionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          window.history.replaceState({}, document.title);
        }}
        summaryData={summaryPayload}
      />

      {/* Welcome Section */}
      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Overview</p>
        <h2 className="text-4xl font-extrabold text-text tracking-tight">
          {user ? `Hello, ${user.display_name || user.email.split('@')[0]}` : 'Welcome, Guest'}
        </h2>
        <p className="text-lg text-text-muted">Ready to find your focus? Here are your metrics for today.</p>
      </section>

      {/* Resume Session Banner */}
      {activeSession && (
        <div className="p-4 bg-surface border border-info rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-info/10 text-info rounded-xl">
              <span className="material-symbols-rounded block">motion_photos_on</span>
            </div>
            <div>
              <h3 className="font-bold text-text">Active Session Detected</h3>
              <p className="text-text-muted text-sm">You have an ongoing {activeSession.activity_type} session.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/timer')}
            className="px-6 py-2.5 bg-info text-white rounded-xl font-bold hover:bg-info/90 transition-colors"
          >
            Resume Session
          </button>
        </div>
      )}

      {/* Stats Cards - Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Focus Score', value: stats.focusScore, icon: 'bolt', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Sessions', value: stats.sessionsToday, icon: 'schedule', color: 'text-info', bg: 'bg-info/10' },
          { label: 'Tasks', value: stats.tasksCompleted, icon: 'check_circle', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Streak', value: `${stats.streakDays} Days`, icon: 'local_fire_department', color: 'text-warning', bg: 'bg-warning/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border p-6 rounded-3xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-black text-text mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Main Content Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity List */}
          <section className="bg-surface border border-border rounded-3xl p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">Recent Sessions</h3>
              <button
                onClick={() => navigate('/analytics')}
                className="text-sm font-bold text-text-muted hover:text-primary-500 transition-colors"
              >
                View Analytics
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentSessions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-text-muted bg-bg/50 rounded-2xl border border-dashed border-border">
                  <span className="material-symbols-rounded text-4xl mb-2 opacity-50">history</span>
                  <p>No sessions recorded today.</p>
                </div>
              ) : (
                stats.recentSessions.map((session: any) => (
                  <div key={session._id} className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border hover:border-primary-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-surface rounded-xl shadow-sm border border-border">
                        <span className="material-symbols-rounded text-text-muted block">
                          {session.activity_type === 'coding' ? 'terminal' : 'book_4'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-text">{session.task_name || 'Deep Work Session'}</p>
                        <div className="flex items-center gap-2 text-sm text-text-muted mt-0.5">
                          <span className="capitalize">{session.activity_type}</span>
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
          {/* Quick Controls Widget */}
          <section className="bg-surface border border-border rounded-3xl p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-bold text-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Deep Code Mode', subtitle: 'High Intensity • ∞ Infinity', icon: 'all_inclusive',
                  action: () => navigate('/timer', { state: { sessionData: { activity_type: 'coding', focus_level: 'high', task_name: 'Deep Work', duration_minutes: 0, session_type: 'work', is_infinity: true } } })
                },
                {
                  title: 'Quick Reading', subtitle: 'Low Intensity • 25m', icon: 'book_4',
                  action: () => navigate('/timer', { state: { sessionData: { activity_type: 'reading', focus_level: 'low', task_name: 'Light Reading', duration_minutes: 25, session_type: 'work' } } })
                },
                {
                  title: 'Quick Add Task', subtitle: 'Jot down a quick todo', icon: 'add_task',
                  action: () => navigate('/tasks')
                }
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  className="w-full flex items-center justify-between p-4 bg-bg rounded-2xl border border-transparent hover:border-border hover:bg-surface transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-rounded text-primary-500 group-hover:scale-110 transition-transform">{btn.icon}</span>
                    <div>
                      <p className="font-bold text-text text-sm">{btn.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{btn.subtitle}</p>
                    </div>
                  </div>
                  <span className="material-symbols-rounded text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">chevron_right</span>
                </button>
              ))}
            </div>
          </section>

          {/* Motivation Insight Card */}
          <section className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-primary-400/30">
              <span className="material-symbols-rounded text-9xl block" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            </div>
            <div className="relative z-10">
              <p className="text-lg font-medium leading-relaxed italic mb-6">
                "The way to get started is to quit talking and begin doing."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <span className="material-symbols-rounded text-sm block">person</span>
                </div>
                <p className="font-bold text-sm">Walt Disney</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
