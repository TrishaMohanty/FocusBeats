import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function MusicPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, setPlaylist } = useAudio();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/music')
      .then(setTracks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stations = useMemo(() => {
    const groups: Record<string, any[]> = {};
    tracks.forEach(track => {
      const s = track.station || 'Focus Beats Collective';
      if (!groups[s]) groups[s] = [];
      groups[s].push(track);
    });
    return Object.entries(groups).map(([name, tracks]) => ({
      name,
      tracks,
      category: tracks[0].category,
      focusLevel: tracks[0].focus_level
    }));
  }, [tracks]);

  const handlePlayStation = (stationTracks: any[]) => {
    setPlaylist(stationTracks);
    playTrack(stationTracks[0]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-xl animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* Hero Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-surface border border-border p-12 mb-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl">
           <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-500 mb-4 italic">Audio Intelligence</p>
           <h2 className="text-6xl font-black text-text tracking-tighter mb-6 italic uppercase">The Studio</h2>
           <p className="text-xl text-text-muted leading-relaxed font-medium">
             Your focus is fragile. Protect it with immersive soundscapes engineered for deep concentration and cognitive flow.
           </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <span className="material-symbols-rounded animate-spin text-primary-500 text-6xl">refresh</span>
           <p className="text-xs font-black uppercase tracking-widest text-text-muted">Synchronizing Frequencies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
          {stations.map((station, idx) => (
            <div 
              key={idx}
              className="bg-surface border border-border rounded-[2.5rem] p-8 group hover:border-primary-500/40 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-sm relative group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-rounded text-3xl">
                    {station.category === 'lofi' ? 'coffee' : station.category === 'ambient' ? 'wb_cloudy' : station.category === 'cyberpunk' ? 'terminal' : 'graphic_eq'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="px-4 py-1.5 bg-bg border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                      {station.tracks.length} Channels
                   </span>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     station.focusLevel === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                   }`}>
                      {station.focusLevel} Focus
                   </span>
                </div>
              </div>

              <div className="relative z-10 mb-8">
                <h3 className="text-3xl font-black text-text tracking-tighter mb-2 italic uppercase group-hover:text-primary-500 transition-colors">{station.name}</h3>
                <p className="text-text-muted font-medium leading-relaxed">
                   {station.category === 'lofi' ? "Warm textures and rhythmic beats for creative flow." : 
                    station.category === 'ambient' ? "Stateless atmospheric frequencies to wash away distractions." :
                    "Hard-coded soundscapes for absolute terminal focus."}
                </p>
              </div>

              <div className="relative z-10 flex gap-4">
                <button 
                  onClick={() => handlePlayStation(station.tracks)}
                  className="px-8 py-4 bg-text text-bg rounded-2xl font-black text-sm uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bg/20 flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-lg">radio</span>
                  Launch Station
                </button>
                <div className="flex-1 flex items-center gap-1.5 px-4 overflow-hidden">
                   {station.tracks.slice(0, 3).map((t: any, i: number) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${currentTrack?._id === t._id && isPlaying ? 'bg-primary-500 animate-pulse' : 'bg-border'}`} />
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth Gate */}
      {!user && (
        <div className="mt-xl p-12 bg-surface border border-border rounded-[3rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute inset-0 bg-primary-500/5 blur-3xl rounded-full"></div>
          <div className="p-6 bg-primary-500/10 text-primary-500 rounded-3xl relative z-10">
             <span className="material-symbols-rounded text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-3xl font-black text-text mb-2 tracking-tight italic uppercase">Private Studio Access</h3>
            <p className="text-text-muted font-medium max-w-xl">
               Draft your own focus missions and save personalized audio stations by creating a global identity.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="md:ml-auto px-10 py-4 bg-primary-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-tighter shadow-xl shadow-primary-500/20 relative z-10"
          >
            Authenticate Now
          </button>
        </div>
      )}
    </div>
  );
}
