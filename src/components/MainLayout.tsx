import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StartSessionModal } from './StartSessionModal';

import { MusicPlayer } from './MusicPlayer';

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
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);

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

  const [sidebarMode, setSidebarMode] = useState<'fixed' | 'auto-hide'>(() => {
    return (localStorage.getItem('sidebar_mode') as 'fixed' | 'auto-hide') || 'fixed';
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

  useEffect(() => {
    localStorage.setItem('sidebar_mode', sidebarMode);
  }, [sidebarMode]);

  useEffect(() => {
    const handleModeChange = () => {
      const newMode = (localStorage.getItem('sidebar_mode') as 'fixed' | 'auto-hide') || 'fixed';
      setSidebarMode(newMode);
    };

    window.addEventListener('sidebarModeChange', handleModeChange);
    return () => window.removeEventListener('sidebarModeChange', handleModeChange);
  }, []);

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
    navigate('/timer', { state: { sessionData } });
  };

  return (
    <div className="bg-bg min-h-screen text-text font-sans selection:bg-primary-500/30">
      {/* SideNavBar Component */}
      <aside className={`h-screen fixed left-0 top-0 bg-surface flex flex-col p-4 gap-2 border-r border-border transition-all duration-300 group/sidebar
        ${sidebarMode === 'auto-hide' ? 'z-[60] -translate-x-[calc(100%-4px)] hover:translate-x-0 !shadow-2xl' : 'z-50'}
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Invisible edge trigger for auto-hide mode */}
        {sidebarMode === 'auto-hide' && (
          <div className="absolute right-0 top-0 w-8 h-full bg-transparent group-hover/sidebar:hidden" />
        )}
        <div className={`flex items-center mb-8 px-2 py-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div onClick={toggleSidebar} className="cursor-pointer flex-shrink-0 text-primary-500">
              <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0 pr-2">
                <h1 className="text-lg font-black text-text tracking-tight truncate">FocusBeats</h1>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest truncate">Productivity Suite</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button onClick={toggleSidebar} className="flex-shrink-0 text-text-muted hover:text-text transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg mr-1">
              <span className="material-symbols-rounded text-xl">keyboard_double_arrow_left</span>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group/nav ${isActive
                      ? 'bg-primary-500/10 text-primary-500 font-black shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-bg'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_12px_var(--color-primary-500)] animate-in slide-in-from-left-full duration-300"></div>
                  )}
                  <span className={`material-symbols-rounded text-[22px] transition-transform group-hover/nav:scale-110 ${isActive ? 'scale-110' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                  {!isSidebarCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                  
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-text text-bg text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-[70] shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full py-4 bg-primary-500 text-white rounded-xl font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-[0_4px_12px_var(--color-primary-500)] shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-transform ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
            title={isSidebarCollapsed ? "New Entry" : undefined}
          >
            <span className="material-symbols-rounded text-lg">add</span>
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
      <main className={`flex-1 min-h-screen relative p-8 transition-all duration-300 
        ${sidebarMode === 'auto-hide' ? 'ml-0' : (isSidebarCollapsed ? 'ml-20' : 'ml-72')}`}>
        
        {/* Invisible Overlay for Account Popup to handle outside clicks */}
        {isAccountPopupOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsAccountPopupOpen(false)}
          />
        )}

        {/* TopNavBar Component */}
        <header className={`fixed top-0 right-0 h-20 bg-bg/80 backdrop-blur-xl border-b border-border z-40 flex justify-between items-center px-8 transition-all duration-300 
          ${sidebarMode === 'auto-hide' ? 'w-full' : (isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-18rem)]')}`}>
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center px-4 py-2 bg-surface border border-border/60 rounded-xl shadow-subtle focus-within:border-primary-500/50 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group">
              <span className="material-symbols-rounded text-text-muted text-[20px] group-focus-within:text-primary-500 transition-colors">search</span>
              <input
                className="bg-transparent border-none outline-none text-text placeholder:text-text-muted/60 w-64 ml-2 font-medium text-sm"
                placeholder="Search focus sessions..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors"
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                <span className="material-symbols-rounded text-[22px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors">
                <span className="material-symbols-rounded text-[22px]">notifications</span>
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg transition-colors ${location.pathname === '/settings' ? 'text-primary-500 bg-primary-500/5' : 'text-text-muted hover:text-text'}`}
              >
                <span className="material-symbols-rounded text-[22px]" style={location.pathname === '/settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
              </button>
            </div>
            <div className="w-px h-8 bg-border"></div>
            
            <div className="relative flex items-center z-50">
              <div 
                className="flex items-center group cursor-pointer"
                onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
              >
                <div className="flex flex-col items-end mr-3">
                  <p className="text-sm font-bold text-text group-hover:text-primary-500 transition-colors">{user ? user.display_name : 'Guest Account'}</p>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-lg border-2 transition-colors shadow-sm ${
                  isAccountPopupOpen 
                    ? 'border-primary-500 bg-primary-100 text-primary-700' 
                    : 'bg-primary-50 text-primary-600 border-primary-200 group-hover:border-primary-400 group-hover:bg-primary-100'
                }`}>
                  {user ? (
                    <div>{user.email[0].toUpperCase()}</div>
                  ) : (
                    <span className="material-symbols-rounded">person</span>
                  )}
                </div>
              </div>

              {/* Account Dropdown / Popup */}
              {isAccountPopupOpen && (
                <div 
                  className="absolute top-14 right-0 w-80 bg-surface border border-border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] rounded-2xl p-md animate-in fade-in slide-in-from-top-2 duration-200 cursor-default" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 border-b border-border pb-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border border-primary-200">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text">{user.display_name}</p>
                          <p className="text-xs text-text-muted truncate w-48">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full py-2.5 bg-error/10 text-error hover:bg-error/20 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-rounded text-[20px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 border-b border-border pb-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>no_accounts</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text mb-1">Guest Account</p>
                          <p className="text-xs text-text-muted leading-relaxed">
                            Your sessions are not being saved. Guests cannot track focus trends, use the planner, or sync data across devices.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to="/login" 
                          onClick={() => setIsAccountPopupOpen(false)}
                          className="flex-1 py-2.5 bg-bg border border-border hover:bg-surface rounded-xl font-bold text-sm text-center transition-colors text-text"
                        >
                          Log In
                        </Link>
                        <Link 
                          to="/register" 
                          onClick={() => setIsAccountPopupOpen(false)}
                          className="flex-1 py-2.5 bg-primary-500 text-white hover:bg-primary-600 rounded-xl font-bold text-sm text-center shadow-sm shadow-primary-500/20 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Area */}
        <div className="pt-20">
          {children}
        </div>
      </main>

      <MusicPlayer />
    </div>
  );
}
