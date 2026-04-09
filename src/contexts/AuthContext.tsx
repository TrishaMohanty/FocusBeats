import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  display_name: string;
  focus_score: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('focusbeats_token');
    
    if (token) {
      api.get('/auth/me')
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token invalid or expired
          localStorage.removeItem('focusbeats_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  async function signUp(email: string, password: string, displayName: string) {
    const data = await api.post('/auth/register', { email, password, displayName });
    localStorage.setItem('focusbeats_token', data.token);
    setUser({
      id: data.id,
      email: data.email,
      display_name: data.display_name,
      focus_score: data.focus_score || 0,
    });
  }

  async function signIn(email: string, password: string) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('focusbeats_token', data.token);
    setUser({
      id: data.id,
      email: data.email,
      display_name: data.display_name,
      focus_score: data.focus_score || 0,
    });
  }

  async function signOut() {
    localStorage.removeItem('focusbeats_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
