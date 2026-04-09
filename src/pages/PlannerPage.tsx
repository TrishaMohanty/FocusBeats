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
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="bg-surface border border-border p-xl rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center w-full ">
          <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
          </div>
          <h3 className="text-2xl font-bold text-text mb-2">Login Required</h3>
          <p className="text-text-muted mb-lg">You must be logged in to access the study planner.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-bg text-text border border-border hover:bg-surface hover:border-primary-300 font-bold rounded-lg transition-colors shadow-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-lg border-b border-border pb-md">
        <div className="flex flex-col gap-xs">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Schedule</p>
          <h2 className="text-4xl font-extrabold text-text tracking-tight">Study Planner</h2>
        </div>
        <button className="px-md py-sm bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm shadow-primary-500/20">
          <span className="material-symbols-rounded text-lg">add</span>
          New Entry
        </button>
      </div>

      <div className="bg-surface border border-border p-xl rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] min-h-[400px]">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center mt-xl">
            <div className="w-16 h-16 bg-bg text-text-muted rounded-full flex items-center justify-center border border-dashed border-border mb-md">
              <span className="material-symbols-rounded text-3xl">event_upcoming</span>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">No Planner Entries</h3>
            <p className="text-text-muted">Schedule a session above to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {/* Entries map would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
