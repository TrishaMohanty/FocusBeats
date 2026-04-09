import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function MusicPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack } = useAudio();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/music')
      .then(setTracks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-xs mb-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Audio Discovery</p>
        <h2 className="text-4xl font-extrabold text-text tracking-tight">Focus Sounds</h2>
        <p className="text-lg text-text-muted">Immersive soundscapes for deep concentration.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
           <span className="material-symbols-rounded animate-spin text-primary-500 text-4xl">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {tracks.map((track) => (
            <div 
              key={track._id}
              className={`bg-surface border p-lg rounded-xl shadow-sm transition-all group hover:shadow-lg ${
                currentTrack?._id === track._id ? 'border-primary-500 ring-4 ring-primary-500/5' : 'border-border hover:border-primary-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-sm transition-all ${
                currentTrack?._id === track._id && isPlaying ? 'bg-primary-500 text-white animate-pulse' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 group-hover:scale-110'
              }`}>
                <span className="material-symbols-rounded">
                  {currentTrack?._id === track._id && isPlaying ? 'volume_up' : 'graphic_eq'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-text mb-1">{track.title}</h3>
              <p className="text-text-muted text-sm mb-md uppercase tracking-widest font-black text-[10px]">{track.category} • {track.focus_level} Focus</p>
              
              <button 
                onClick={() => playTrack(track)}
                className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  currentTrack?._id === track._id && isPlaying 
                    ? 'bg-text text-bg shadow-lg' 
                    : 'bg-bg text-text border border-border hover:border-primary-500 hover:text-primary-500'
                }`}
              >
                <span className="material-symbols-rounded text-lg">
                  {currentTrack?._id === track._id && isPlaying ? 'pause' : 'play_arrow'}
                </span> 
                {currentTrack?._id === track._id && isPlaying ? 'Playing Now' : 'Play Track'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-lg p-xl bg-surface border-2 border-dashed border-border rounded-3xl flex flex-col md:flex-row items-center gap-md text-center md:text-left">
          <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
             <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-text mb-1">Unlock Personalized Focus</h3>
            <p className="text-text-muted text-sm font-medium">Create an account to save your favorite tracks and get AI recommendations tailored to your activity.</p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="md:ml-auto px-8 py-3 bg-text text-bg font-bold rounded-2xl hover:scale-105 transition-all text-sm"
          >
            Sign Up Free
          </button>
        </div>
      )}
    </div>
  );
}
