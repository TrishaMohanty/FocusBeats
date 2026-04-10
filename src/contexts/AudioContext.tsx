import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
  _id: string;
  title: string;
  category: string;
  focus_level: string;
  activity_type: string;
  embed_url: string;
  station?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  togglePlay: () => void;
  playTrack: (track: Track) => void;
  playNext: () => void;
  playPrev: () => void;
  playSmart: (activityType: string) => void;
  setPlaylist: (tracks: Track[]) => void;
  setVolume: (volume: number) => void;
  fadeVolume: (target: number, duration: number) => void;
  seekTo: (time: number) => void;
  playlist: Track[];
  allTracks: Track[];
  loading: boolean;
  analyser: AnalyserNode | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem('focusbeats_audio_volume')) || 70;
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Audio Singleton
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    // IMPORTANT for Analyser to work with external URLs
    audio.crossOrigin = "anonymous";
    
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (playlist.length > 0) {
        playNext();
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Initial load of music library
    const loadLibrary = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/music`);
        const data = await response.json();
        setAllTracks(data);
      } catch (err) {
        console.error('Failed to preload music library:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLibrary();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Update volume on audio element
  useEffect(() => {
    localStorage.setItem('focusbeats_audio_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Lazy initialize Audio Context on user interaction (browser policy)
  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new Ctx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    
    initAudioContext();
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      initAudioContext();
      
      if (currentTrack?._id === track._id) {
        if (!isPlaying) {
           audioRef.current.play().catch(console.error);
           setIsPlaying(true);
        }
        return;
      }

      audioRef.current.src = track.embed_url;
      audioRef.current.play().catch(console.error);
      setCurrentTrack(track);
      setIsPlaying(true);
      
      // Update index if in playlist
      const idx = playlist.findIndex(t => t._id === track._id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    playTrack(playlist[nextIdx]);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    playTrack(playlist[prevIdx]);
  };

  const playSmart = (activityType: string) => {
    if (allTracks.length === 0) return;
    
    // Normalize activity type
    const activity = activityType.toLowerCase();
    
    // Find matching tracks based on category or activity_type in DB
    let filtered = allTracks.filter(t => 
      t.activity_type?.toLowerCase() === activity || 
      t.category?.toLowerCase().includes(activity)
    );

    // Fallback logic if no exact activity match
    if (filtered.length === 0) {
      if (['coding', 'debugging', 'testing', 'refactoring'].includes(activity)) {
        filtered = allTracks.filter(t => t.category === 'cyberpunk' || t.category === 'lofi');
      } else if (['writing', 'documentation', 'reading'].includes(activity)) {
        filtered = allTracks.filter(t => t.category === 'ambient');
      } else {
        filtered = [allTracks[0]]; // Final fallback
      }
    }

    if (filtered.length > 0) {
      setPlaylist(filtered);
      playTrack(filtered[0]);
    }
  };

  const setPlaylist = (tracks: Track[]) => {
    setPlaylistState(tracks);
    setCurrentIndex(-1); // Reset index for new playlist
  };

  const fadeVolume = (target: number, duration: number) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    const steps = 30;
    const stepTime = duration / steps;
    const volumeStep = (target - volume) / steps;
    let currentV = volume;

    fadeIntervalRef.current = setInterval(() => {
      currentV += volumeStep;
      if ((volumeStep > 0 && currentV >= target) || (volumeStep < 0 && currentV <= target)) {
        currentV = target;
        clearInterval(fadeIntervalRef.current!);
        setVolume(target);
      } else {
        setVolume(Math.round(currentV));
      }
    }, stepTime);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      progress,
      duration,
      togglePlay,
      playTrack,
      playNext,
      playPrev,
      playSmart,
      setPlaylist,
      setVolume,
      fadeVolume,
      seekTo,
      playlist,
      allTracks,
      loading,
      analyser: analyserRef.current
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
