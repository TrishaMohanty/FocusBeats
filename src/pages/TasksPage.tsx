import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      api.get('/tasks').then(setTasks).catch(console.error);
    }
  }, [user]);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-on-surface">Tasks</h2>
        <button 
          onClick={() => {
            if (!user) navigate('/login');
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Add Task
        </button>
      </div>
      
      {!user ? (
        <div className="p-8 bg-surface-container rounded-2xl text-center border border-outline-variant/20 shadow-sm mt-8">
          <span className="material-symbols-outlined text-6xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-slate-500 mb-6">You must be logged in to create and manage tasks.</p>
          <button onClick={() => navigate('/login')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Sign In</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-500">Your tasks will appear here.</p>
        </div>
      )}
    </>
  );
}
