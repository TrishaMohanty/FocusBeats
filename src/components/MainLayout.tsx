import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StartSessionModal } from './StartSessionModal';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Timer', path: '/timer', icon: 'timer' },
  { label: 'Music', path: '/music', icon: 'music_note' },
  { label: 'Tasks', path: '/tasks', icon: 'check_circle' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartSession = (sessionData: any) => {
    // Navigate to timer with the session data state
    navigate('/timer', { state: { sessionData } });
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0e0e0e] text-on-surface flex min-h-screen font-body">
      {/* SideNavBar Component */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-900 flex flex-col p-4 gap-2 z-50 border-r border-[#BBCABF]/10">
        <div className="flex items-center gap-3 mb-8 px-4 py-4">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-[#191C1D] dark:text-white">Editorial</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Productivity Suite</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-primary-fixed shadow-[0px_12px_32px_rgba(25,28,29,0.04)] font-bold scale-98 active-nav-fill'
                    : 'text-slate-400 dark:text-slate-500 hover:text-on-surface hover:bg-surface-container-low transition-colors'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            New Entry
          </button>
        </div>
      </aside>

      {/* Start Session Modal */}
      <StartSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStart={handleStartSession}
      />

      {/* Main Canvas */}
      <main className="flex-1 ml-64 min-h-screen relative p-8">
        {/* TopNavBar Component */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#BBCABF]/10 z-40 flex justify-between items-center px-12">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-lg">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Search insights..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="h-6 w-[1px] bg-outline-variant/20"></div>
            <div className="flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-on-surface">{user ? user.display_name : 'Guest Account'}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-primary-container/10 flex items-center justify-center">
                    {user ? (
                        <div className="text-primary font-black">{user.email[0].toUpperCase()}</div>
                    ) : (
                        <span className="material-symbols-outlined text-primary">person</span>
                    )}
                </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-20 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
