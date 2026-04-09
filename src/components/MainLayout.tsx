import { useState, useEffect } from 'react';
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
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
     if (typeof window !== 'undefined') {
         return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
     }
     return false;
  });

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
     return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
      const root = window.document.documentElement;
      if (isDarkMode) {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [isDarkMode]);

  const toggleSidebar = () => {
      setIsSidebarCollapsed(prev => {
          localStorage.setItem('sidebar_collapsed', String(!prev));
          return !prev;
      });
  };

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
      <aside className={`h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 flex flex-col p-4 gap-2 z-50 border-r border-[#BBCABF]/10 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center mb-8 px-2 py-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 min-w-10 bg-primary-container rounded-xl flex items-center justify-center text-white cursor-pointer" onClick={toggleSidebar}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              </div>
              {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <h1 className="text-xl font-black tracking-tighter">Editorial</h1>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-muted font-bold truncate">Productivity Suite</p>
                  </div>
              )}
          </div>
          {!isSidebarCollapsed && (
             <button onClick={toggleSidebar} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">keyboard_double_arrow_left</span>
             </button>
          )}
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
                    ? 'bg-background shadow-xs text-primary font-bold scale-98 active-nav-fill border border-outline'
                    : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-low transition-colors'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!isSidebarCollapsed && <span className="text-sm font-bold tracking-tight truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-2">
          {isSidebarCollapsed && (
             <button onClick={toggleSidebar} className="w-full flex justify-center py-4 mb-2 text-on-surface-muted hover:text-primary">
                 <span className="material-symbols-outlined text-sm">keyboard_double_arrow_right</span>
             </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
            title={isSidebarCollapsed ? "New Entry" : undefined}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            {!isSidebarCollapsed && "New Entry"}
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
      <main className={`flex-1 min-h-screen relative p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* TopNavBar Component */}
        <header className={`fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline z-40 flex justify-between items-center px-12 transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-lg">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted text-lg">search</span>
              <input
                className="w-full bg-surface-low border-none rounded-full py-2 pl-12 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none"
                placeholder="Search insights..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="text-on-surface-muted hover:text-primary transition-colors flex items-center justify-center p-2"
                  title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                 <span className="material-symbols-outlined text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button className="text-on-surface-muted hover:text-primary transition-colors p-2">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="text-on-surface-muted hover:text-primary transition-colors">
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
