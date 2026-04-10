import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MusicPlayer } from './MusicPlayer';
import { useSession } from '../contexts/SessionContext';
import { StartSessionModal } from './StartSessionModal';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Timer', path: '/timer', icon: 'timer' },
  { label: 'Music', path: '/music', icon: 'music_note' },
  { label: 'Tasks', path: '/tasks', icon: 'check_circle' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
];


function MiniTimer() {
  const { timerState } = useSession();
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timerState.isRunning && timerState.targetEndTime) {
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((timerState.targetEndTime! - Date.now()) / 1000));
        setDisplayTime(remaining);
      };
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setDisplayTime(timerState.timeLeft);
    }
    return () => clearInterval(interval);
  }, [timerState]);

  if (!timerState.targetEndTime && timerState.timeLeft === 0) return null;

  const mins = Math.floor(displayTime / 60);
  const secs = displayTime % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  
  const progress = timerState.totalDuration > 0 ? ((timerState.totalDuration - displayTime) / timerState.totalDuration) * 100 : 0;

  return (
    <Link 
      to="/timer"
      className="flex items-center gap-3 px-3 py-1.5 bg-surface border border-border rounded-xl hover:border-primary-500/50 transition-all group animate-in fade-in zoom-in duration-300"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
         <svg className="w-full h-full -rotate-90 absolute inset-0">
           <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-bg" />
           <circle 
              cx="50%" cy="50%" r="40%" 
              stroke="currentColor" strokeWidth="2.5" fill="transparent" 
              strokeDasharray="100" 
              style={{ strokeDashoffset: Math.max(0, 100 - progress) }} 
              className={`${timerState.sessionType === 'work' ? 'text-primary-500' : 'text-amber-500'} transition-all duration-1000`} 
              strokeLinecap="round"
           />
         </svg>
         {timerState.isRunning && (
            <div className={`w-1 h-1 rounded-full animate-ping ${timerState.sessionType === 'work' ? 'bg-primary-500' : 'bg-amber-500'}`}></div>
         )}
      </div>
      <span className="text-xs font-black tabular-nums tracking-tight">{timeStr}</span>
      <div className="flex flex-col gap-0.5 pointer-events-none">
        <span className="text-[8px] font-black uppercase text-text-muted leading-none">
           {timerState.sessionType === 'work' ? 'Focus' : 'Break'}
        </span>
      </div>
    </Link>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);
  const { isStartModalOpen, openSessionModal, closeSessionModal } = useSession();

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

  const startSession = (sessionData: any) => {
    localStorage.setItem('focusbeats_active_session', JSON.stringify(sessionData));
    navigate('/timer');
  };

  return (
    <div className="bg-bg min-h-screen text-text font-sans selection:bg-primary-500/30">
      {/* SideNavBar Component */}
      <aside className={`h-screen fixed left-0 top-0 bg-surface flex flex-col p-4 gap-2 border-r border-border transition-all duration-300 group/sidebar
        ${sidebarMode === 'auto-hide' ? 'z-[100] -translate-x-[calc(100%-4px)] hover:translate-x-0 !shadow-2xl' : 'z-50'}
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
          {/* Action-First Sidebar: Removed "New Entry" button as it's now in Header/FAB */}
        </nav>
      </aside>

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
        <header className={`fixed top-0 right-0 h-14 bg-bg/80 backdrop-blur-xl border-b border-border z-[90] flex justify-between items-center px-6 transition-all duration-300 
          ${sidebarMode === 'auto-hide' ? 'w-full' : (isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-18rem)]')}`}>
          
          <div className="flex items-center gap-4">
            {/* Action-First Navigation (Search removed) */}
          </div>

          {/* Center/Right: Action-First Global Controls */}
          <div className="flex items-center gap-3">
            <MiniTimer />
            {/* Primary Action Button */}
            <button 
              onClick={() => openSessionModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-sm shadow-md shadow-primary-500/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-rounded text-[18px]">add</span>
              <span className="hidden sm:inline">Start Focus</span>
            </button>
            
            <div className="w-[1px] h-6 bg-border/40 mx-2" />
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
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-lg border-2 transition-colors shadow-sm ${isAccountPopupOpen
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
        <div className="pt-14 pb-20">
          {children}
        </div>

        {/* Floating Action Button (FAB) */}
        <button 
          onClick={() => openSessionModal()}
          className="fixed bottom-24 right-8 z-[95] w-14 h-14 bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all group"
        >
          <div className="absolute -top-12 right-0 bg-text text-bg px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Start Focus Session
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-text rotate-45" />
          </div>
          <span className="material-symbols-rounded text-2xl font-bold">rocket_launch</span>
        </button>

        {/* Global Modal handled in AppContent or MainLayout */}
        <StartSessionModal 
          isOpen={isStartModalOpen}
          onClose={closeSessionModal}
          onStart={startSession}
        />
      </main>

      <MusicPlayer />
    </div>
  );
}
