import React from 'react';
import { useAudio } from '../../contexts/AudioContext';

interface TrackRowProps {
  track: {
    _id: string;
    title: string;
    station?: string;
    category: string;
    focus_level: string;
    activity_type: string;
    embed_url: string;
  };
}

export function TrackRow({ track }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const isActive = currentTrack?._id === track._id;

  const handleToggle = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div 
      className={`group flex items-center gap-6 p-4 rounded-3xl transition-all duration-300 border ${
        isActive 
          ? 'bg-primary-500/10 border-primary-500/30' 
          : 'bg-surface border-border hover:border-primary-500/20 hover:bg-bg/50'
      }`}
    >
      {/* Play/Pause Button Area */}
      <button 
        onClick={handleToggle}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isActive 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40' 
            : 'bg-bg text-text-muted group-hover:bg-primary-500/10 group-hover:text-primary-500'
        }`}
      >
        <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: isActive && isPlaying ? "'FILL' 1" : "" }}>
          {isActive && isPlaying ? 'pause_circle' : 'play_circle'}
        </span>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-lg font-black tracking-tight truncate ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-text'}`}>
          {track.title}
        </h4>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest truncate opacity-80">
          {track.station}
        </p>
      </div>

      {/* Waveform Visualization (Dynamic CSS) */}
      <div className="hidden md:flex items-center gap-1 h-10 px-8">
        {[0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
          <div 
            key={i}
            className={`w-1 rounded-full transition-all duration-500 ${
              isActive && isPlaying ? 'bg-primary-500 animate-waveform' : 'bg-border/60'
            }`}
            style={{ 
              height: `${isActive && isPlaying ? h * 100 : 20}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Meta/Tags */}
      <div className="flex items-center gap-4 pr-2">
        <div className="hidden sm:flex items-center gap-2">
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
             track.category === 'lofi' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 
             track.category === 'ambient' ? 'bg-info/10 text-info border-info/20' : 'bg-warning/10 text-warning border-warning/20'
           }`}>
             {track.category}
           </span>
           <span className="px-3 py-1 bg-bg border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-text-muted">
             {track.focus_level} Focus
           </span>
        </div>
        
        <button className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-rose-500 transition-colors">
          <span className="material-symbols-rounded text-xl">favorite</span>
        </button>
      </div>
    </div>
  );
}
