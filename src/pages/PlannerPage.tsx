import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function PlannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      api.get('/planner').then(setEntries).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 bg-surface-container rounded-2xl text-center border border-outline-variant/20 shadow-sm mt-8 max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-6xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
        <h3 className="text-xl font-bold mb-2">Login Required</h3>
        <p className="text-slate-500 mb-6">You must be logged in to access the study planner.</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-on-surface">Study Planner</h2>
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors">
          <span className="material-symbols-outlined">add</span>
          New Entry
        </button>
      </div>
      
      <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/5">
        {entries.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No planner entries found. Schedule a session above.</p>
        ) : (
          <div className="space-y-4">
             {/* Entries map would go here */}
          </div>
        )}
      </div>
    </>
  );
}
