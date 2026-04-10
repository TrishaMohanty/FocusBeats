import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';

interface MusicPlayerProps {
  isSidebarCollapsed?: boolean;
  sidebarMode?: 'fixed' | 'auto-hide';
}

export function MusicPlayer({ isSidebarCollapsed = false, sidebarMode = 'fixed' }: MusicPlayerProps) {
  const { currentTrack, isPlaying, togglePlay, volume, setVolume, progress, duration, seekTo, playNext, playPrev, playlist } = useAudio();
  const [isMinimized, setIsMinimized] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateWidth = () => {
    if (sidebarMode === 'auto-hide') return 'w-[calc(100%-4rem)]';
    if (isSidebarCollapsed) return 'w-[calc(100%-8rem)]';
    return 'w-[calc(100%-21rem)]';
  };

  const calculateLeft = () => {
    if (sidebarMode === 'auto-hide') return 'left-8';
    if (isSidebarCollapsed) return 'left-24';
    return 'left-[19rem]';
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-6 ${calculateLeft()} w-14 h-14 bg-surface/40 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] text-primary-500 animate-in zoom-in duration-300`}
      >
        <div className="relative">
          <span className="material-symbols-rounded text-2xl">music_note</span>
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-bg animate-pulse"></span>
          )}
        </div>
      </button>
    );
  }

  return (
    <footer className={`fixed bottom-6 ${calculateLeft()} ${calculateWidth()} h-20 bg-surface/30 backdrop-blur-3xl border border-white/10 rounded-[32px] z-[100] px-8 flex items-center justify-between transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group/player animate-in slide-in-from-bottom-10 pointer-events-auto`}>
      
      {/* Detached Background Accent - explicitly behind */}
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none z-0" />

      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-[28%] z-10 relative">
        <div className="relative w-12 h-12 flex-shrink-0 group/art">
          <div className="absolute -inset-1 bg-primary-500/20 rounded-2xl blur-sm opacity-0 group-hover/art:opacity-100 transition-opacity" />
          <div className="w-full h-full bg-surface/40 rounded-xl flex items-center justify-center border border-white/10 shadow-inner relative overflow-hidden">
            {isPlaying ? (
               <div className="flex items-end gap-[3px] h-5 mb-1">
                  <div className="w-1 bg-primary-500 animate-[music-bar_0.6s_ease-in-out_infinite] h-2"></div>
                  <div className="w-1 bg-primary-500 animate-[music-bar_0.8s_ease-in-out_infinite] h-5"></div>
                  <div className="w-1 bg-primary-500 animate-[music-bar_0.7s_ease-in-out_infinite] h-3"></div>
               </div>
            ) : (
              <span className="material-symbols-rounded text-primary-500 group-hover:scale-110 transition-transform text-2xl">music_note</span>
            )}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-black text-text text-sm truncate tracking-tight hover:text-primary-500 cursor-pointer transition-colors leading-tight">
            {currentTrack?.title || 'Ambient Flow'}
          </h4>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mt-0.5 opacity-80">
            {currentTrack?.category || 'FocusBeats Radio'}
          </p>
        </div>
      </div>

      {/* Center: Essential Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[45%] z-10 relative">
        <div className="flex items-center gap-8">
          <button 
            onClick={playPrev}
            disabled={playlist.length === 0}
            className="text-text-muted hover:text-text transition-all hover:scale-110 active:scale-90 disabled:opacity-20 flex items-center justify-center pointer-events-auto"
          >
            <span className="material-symbols-rounded text-2xl">skip_previous</span>
          </button>
          
          <button 
            onClick={togglePlay}
            className={`w-12 h-12 rounded-full bg-text text-bg flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl relative group/play pointer-events-auto`}
          >
            {isPlaying && (
              <div className="absolute -inset-2 bg-primary-500/20 rounded-full blur-md animate-pulse" />
            )}
            <span className="material-symbols-rounded text-2xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button 
            onClick={playNext}
            disabled={playlist.length === 0}
            className="text-text-muted hover:text-text transition-all hover:scale-110 active:scale-90 disabled:opacity-20 flex items-center justify-center pointer-events-auto"
          >
            <span className="material-symbols-rounded text-2xl">skip_next</span>
          </button>
        </div>
        
        <div className="w-full flex items-center gap-4 group/progress relative z-10">
          <span className="text-[10px] font-black text-text-muted w-10 text-right tabular-nums tracking-tighter">
            {formatTime(progress)}
          </span>
          <div 
            className="flex-1 h-1.5 bg-bg/40 backdrop-blur-md rounded-full relative cursor-pointer overflow-hidden border border-white/5 pointer-events-auto"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const p = x / rect.width;
              seekTo(p * duration);
            }}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-primary-500 rounded-full group-hover/progress:bg-primary-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${(progress / duration) * 100 || 0}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-text-muted w-10 tabular-nums tracking-tighter">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Master Controls */}
      <div className="flex items-center justify-end gap-6 w-[28%] z-10 relative">
        <div className="hidden lg:flex items-center gap-3 w-28 group/vol relative">
          <span className="material-symbols-rounded text-text-muted text-lg transition-colors group-hover/vol:text-primary-500">
            {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
          </span>
          <div 
            className="flex-1 h-1 bg-bg/40 backdrop-blur-sm rounded-full relative cursor-pointer overflow-hidden border border-white/5 pointer-events-auto"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setVolume(Math.round((x / rect.width) * 100));
            }}
          >
             <div 
               className="absolute inset-y-0 left-0 bg-text/30 group-hover/vol:bg-primary-500 transition-colors"
               style={{ width: `${volume}%` }}
             />
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-white/10 transition-all pointer-events-auto">
            <span className="material-symbols-rounded text-[20px]">queue_music</span>
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-primary-500 hover:bg-primary-500/10 transition-all pointer-events-auto"
            title="Minimize Player"
          >
            <span className="material-symbols-rounded text-[20px]">expand_more</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
