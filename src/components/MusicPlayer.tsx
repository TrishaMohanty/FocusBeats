import { useAudio } from '../contexts/AudioContext';

export function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, volume, setVolume, progress, duration, seekTo } = useAudio();

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="h-16 flex items-center justify-between w-full">
      
      {/* Left: Track Info (Compact) */}
      <div className="flex items-center gap-3 w-[25%] lg:w-[30%]">
        <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden group">
          {isPlaying ? (
             <div className="flex items-end gap-[2px] h-4">
                <div className="w-1 bg-primary-500 animate-[music-bar_0.6s_ease-in-out_infinite] h-2"></div>
                <div className="w-1 bg-primary-500 animate-[music-bar_0.8s_ease-in-out_infinite] h-4"></div>
                <div className="w-1 bg-primary-500 animate-[music-bar_0.7s_ease-in-out_infinite] h-3"></div>
             </div>
          ) : (
            <span className="material-symbols-rounded text-primary-500 group-hover:scale-110 transition-transform text-xl">music_note</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-bold text-text text-sm truncate hover:text-primary-500 cursor-pointer transition-colors">
            {currentTrack?.title || 'No Track Selected'}
          </h4>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-wider truncate">
            {currentTrack?.category || 'FocusBeats'}
          </p>
        </div>
      </div>

      {/* Center: Controls & Progress (Essential) */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[50%] lg:max-w-[40%]">
        <div className="flex items-center gap-6">
          <button className="text-text-muted hover:text-text transition-colors btn-press">
            <span className="material-symbols-rounded text-[18px]">skip_previous</span>
          </button>
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className={`w-9 h-9 rounded-full bg-text text-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-rounded text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button className="text-text-muted hover:text-text transition-colors btn-press">
            <span className="material-symbols-rounded text-[18px]">skip_next</span>
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3">
          <span className="text-[9px] font-black text-text-muted w-8 text-right tabular-nums">
            {formatTime(progress)}
          </span>
          <div 
            className="flex-1 h-1 bg-bg border border-border/30 rounded-full relative overflow-hidden group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const p = x / rect.width;
              seekTo(p * duration);
            }}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-primary-500 rounded-full group-hover:bg-primary-400 transition-colors"
              style={{ width: `${(progress / duration) * 100 || 0}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-text-muted w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Essential Tools */}
      <div className="flex items-center justify-end gap-5 w-[25%] lg:w-[30%]">
        <div className="hidden sm:flex items-center gap-2 w-24 group">
          <span className="material-symbols-rounded text-text-muted text-[16px] group-hover:text-text">
            {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
          </span>
          <div 
            className="flex-1 h-1 bg-bg border border-border/30 rounded-full relative overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setVolume(Math.round((x / rect.width) * 100));
            }}
          >
             <div 
               className="absolute inset-y-0 left-0 bg-text/20 group-hover:bg-primary-500 transition-colors"
               style={{ width: `${volume}%` }}
             />
          </div>
        </div>
        <button className="text-text-muted hover:text-text transition-colors btn-press">
          <span className="material-symbols-rounded text-[18px]">queue_music</span>
        </button>
      </div>
    </footer>
  );
}
