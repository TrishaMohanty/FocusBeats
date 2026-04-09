import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  isStartModalOpen: boolean;
  openStartModal: () => void;
  closeStartModal: () => void;
  activeTaskName: string;
  setActiveTaskName: (name: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [activeTaskName, setActiveTaskName] = useState(() => {
    const saved = localStorage.getItem('focusbeats_active_session');
    if (saved) {
      try {
        return JSON.parse(saved).task_name || 'No Active Task';
      } catch (e) {
        return 'No Active Task';
      }
    }
    return 'No Active Task';
  });

  const openStartModal = () => setIsStartModalOpen(true);
  const closeStartModal = () => setIsStartModalOpen(false);

  return (
    <LayoutContext.Provider value={{ 
      isStartModalOpen, 
      openStartModal, 
      closeStartModal,
      activeTaskName,
      setActiveTaskName
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
