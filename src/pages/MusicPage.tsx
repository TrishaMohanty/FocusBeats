import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import { TrackRow } from '../components/music/TrackRow';

export function MusicPage() {
  const { user } = useAuth();
  const { allTracks: tracks, loading } = useAudio();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.station?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-xl animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* Hero Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-surface border border-border p-12 mb-xl group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/10 transition-colors duration-1000"></div>
        <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="material-symbols-rounded">graphic_eq</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 italic">Sonic Engineering</p>
            </div>
            <h2 className="text-7xl font-black text-text tracking-tighter mb-8 italic uppercase leading-none">The Studio</h2>
            <p className="text-xl text-text-muted leading-relaxed font-medium">
              Immersion is the shortcut to flow. Our curated frequencies are designed to isolate your focus and elevate your cognitive state.
            </p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-2 mb-8">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">search</span>
          <input 
            type="text" 
            placeholder="Search vibes, artists, or stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-bold text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
           {['All', 'Lofi', 'Ambient', 'Nature'].map(tag => (
             <button 
              key={tag}
              onClick={() => setSearchQuery(tag === 'All' ? '' : tag)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                (searchQuery.toLowerCase() === tag.toLowerCase() || (tag === 'All' && !searchQuery))
                  ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20' 
                  : 'bg-surface text-text-muted border-border hover:border-text-muted/30'
              }`}
             >
               {tag}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
           <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted animate-pulse">Synchronizing Frequencies...</p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track) => (
              <TrackRow key={track._id} track={track} />
            ))
          ) : (
            <div className="py-24 text-center bg-surface/50 border border-dashed border-border rounded-[3rem]">
               <span className="material-symbols-rounded text-6xl text-text-muted/30 mb-4 block">music_off</span>
               <h3 className="text-xl font-bold text-text-muted">No tracks found for this frequency.</h3>
               <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-primary-500 font-black text-xs uppercase tracking-widest hover:underline"
               >
                 Clear Search Filter
               </button>
            </div>
          )}
        </div>
      )}

      {/* Auth Gate Enhancement */}
      {!user && (
        <div className="mt-xl p-16 bg-surface border border-border rounded-[3.5rem] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden ring-1 ring-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-primary-500/5 blur-3xl rounded-full translate-y-1/2"></div>
          <div className="w-24 h-24 bg-primary-500/10 text-primary-500 rounded-[2.5rem] flex items-center justify-center relative z-10 animate-breathe">
             <span className="material-symbols-rounded text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div className="relative z-10 text-center md:text-left max-w-xl">
            <h3 className="text-4xl font-black text-text mb-4 tracking-tight italic uppercase">Unlock Premium Frequencies</h3>
            <p className="text-lg text-text-muted font-medium leading-relaxed">
               Authentication allows you to save custom playlists, draft deep-work missions, and sync your cognitive progress across all interfaces.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="md:ml-auto px-12 py-5 bg-primary-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-2xl shadow-primary-500/30 relative z-10 hover:bg-primary-600"
          >
            Authenticate Now
          </button>
        </div>
      )}
    </div>
  );
}
