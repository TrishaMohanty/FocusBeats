import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SessionData } from '../types/session';
import { api } from '../lib/api';

interface SessionContextType {
  isStartModalOpen: boolean;
  openSessionModal: (initialData?: Partial<SessionData>) => void;
  closeSessionModal: () => void;
  initialSessionData: Partial<SessionData> | null;
  activeSession: SessionData | null;
  autoSaveCurrentSession: () => Promise<void>;
  timerState: {
    isRunning: boolean;
    targetEndTime: number | null;
    sessionType: 'work' | 'short_break' | 'long_break';
    timeLeft: number;
    totalDuration: number;
    mode: 'focused' | 'pomodoro' | 'infinity';
  };
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [initialSessionData, setInitialSessionData] = useState<Partial<SessionData> | null>(null);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);

  const [timerState, setTimerState] = useState<SessionContextType['timerState']>({
    isRunning: false,
    targetEndTime: null,
    sessionType: 'work',
    timeLeft: 0,
    totalDuration: 0,
    mode: 'focused'
  });

  const syncTimerState = () => {
    const sessionStr = localStorage.getItem('focusbeats_active_session');
    const targetEnd = localStorage.getItem('focusbeats_target_end_time');
    const type = localStorage.getItem('focusbeats_session_type') as any || 'work';
    const running = localStorage.getItem('focusbeats_timer_is_running') === 'true';
    const tLeft = localStorage.getItem('focusbeats_time_left');
    
    let active = null;
    let mode: 'focused' | 'pomodoro' | 'infinity' = 'focused';
    let totalDuration = 25 * 60;

    if (sessionStr) {
      try {
        active = JSON.parse(sessionStr);
        mode = active.mode || 'focused';
        if (type === 'work') {
          totalDuration = (mode === 'focused' ? active.duration_minutes : 25) * 60;
        } else {
          totalDuration = (type === 'long_break' ? 15 : 5) * 60;
        }
        setActiveSession(active);
      } catch (e) {
        console.error("Failed to parse active session", e);
      }
    } else {
      setActiveSession(null);
    }

    setTimerState({
      isRunning: running,
      targetEndTime: targetEnd ? parseInt(targetEnd) : null,
      sessionType: type,
      timeLeft: tLeft ? parseInt(tLeft) : 0,
      totalDuration,
      mode
    });
  };

  useEffect(() => {
    syncTimerState();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('focusbeats_')) {
        syncTimerState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events if we trigger them internally
    window.addEventListener('timer_state_change', syncTimerState);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('timer_state_change', syncTimerState);
    };
  }, [isStartModalOpen]);

  const openSessionModal = (data?: Partial<SessionData>) => {
    setInitialSessionData(data || null);
    setIsStartModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsStartModalOpen(false);
    setInitialSessionData(null);
  };

  const autoSaveCurrentSession = async () => {
    const saved = localStorage.getItem('focusbeats_active_session');
    if (!saved) return;

    try {
      const session = JSON.parse(saved);
      const timeLeft = localStorage.getItem('focusbeats_time_left');
      const duration = session.duration_minutes || 25;
      
      // Calculate how much time was actually spent
      let actualMinutes = duration;
      if (timeLeft) {
        actualMinutes = Math.max(0, Math.round((duration * 60 - parseInt(timeLeft)) / 60));
      }

      await api.post('/sessions', {
        ...session,
        duration_minutes: actualMinutes,
        completed: false
      });

      localStorage.removeItem('focusbeats_active_session');
      localStorage.removeItem('focusbeats_target_end_time');
      localStorage.removeItem('focusbeats_time_left');
      localStorage.removeItem('focusbeats_timer_is_running');
      setActiveSession(null);
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  return (
    <SessionContext.Provider value={{ 
      isStartModalOpen, 
      openSessionModal, 
      closeSessionModal, 
      initialSessionData,
      activeSession,
      autoSaveCurrentSession,
      timerState
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
