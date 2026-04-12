import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { api as apiClient } from '../lib/api';
import { useAuth } from './AuthContext';

// Debug logging utility
const DEBUG = true;
const log = {
  info: (msg: string, data?: any) => DEBUG && console.log(`[AudioContext] ℹ️ ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[AudioContext] ❌ ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[AudioContext] ⚠️ ${msg}`, data || '')
};

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
  error: string | null;
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

// Removed: Demo tracks now fetched from API only

const AudioReactContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
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
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    log.info('Initializing audio element');
    
    // Audio Singleton
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    // IMPORTANT for Analyser to work with Cloudinary URLs
    audio.crossOrigin = "anonymous";
    
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      log.info(`Track loaded: ${audio.duration.toFixed(2)}s`);
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      log.info('Track ended, playing next...');
      if (playlist.length > 0) {
        playNext();
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };
    const handleError = (_e: Event) => {
      const error = audioRef.current?.error;
      if (error) {
        log.error(`Audio playback error (code ${error.code}): ${error.message}`);
        if (error.code === 4) {
          setError('Failed to load audio file. Check the URL and network.');
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Initial setup ends here
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Effect for loading library from API
  useEffect(() => {
    const loadLibrary = async () => {
      if (authLoading) {
        log.info('Auth still loading...');
        return;
      }

      if (!user) {
        log.warn('User not authenticated, cannot load music library');
        setError('Please log in to access music library');
        setAllTracks([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        log.info('Fetching music library from API...');
        const data = await apiClient.get('/music');
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response format');
        }

        log.info(`Loaded ${data.length} track(s) from API`, data.map(t => ({ title: t.title, url: t.embed_url?.substring(0, 50) })));
        
        // Validate URLs
        const validTracks = data.filter((t: Track) => {
          const isValid = t.embed_url && typeof t.embed_url === 'string';
          if (!isValid) {
            log.warn(`Invalid track: missing embed_url`, t);
          }
          return isValid;
        });

        if (validTracks.length === 0) {
          throw new Error('No valid tracks with URLs found');
        }

        setAllTracks(validTracks);
        log.info(`Successfully loaded ${validTracks.length} valid track(s)`);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to load music library';
        log.error(errorMsg, err);
        setError(errorMsg);
        setAllTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [user, authLoading]);

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
    if (!currentTrack) {
      log.warn('togglePlay called with no current track');
      return;
    }
    
    initAudioContext();
    
    if (isPlaying) {
      log.info(`Pausing: "${currentTrack.title}"`);
      audioRef.current?.pause();
    } else {
      log.info(`Resuming: "${currentTrack.title}"`);
      audioRef.current?.play().catch((err: any) => {
        log.error(`Play failed: ${err.message}`, err);
        setError(`Playback failed: ${err.message}`);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (track: Track) => {
    if (!audioRef.current) {
      log.error('Audio element not initialized');
      setError('Audio player not ready');
      return;
    }

    if (!track.embed_url) {
      log.error('Track has no embed_url', track);
      setError(`Cannot play "${track.title}": No URL found`);
      return;
    }

    const isSameTrack = currentTrack?._id === track._id;
    
    if (isSameTrack) {
      log.info(`Same track "${track.title}", resuming playback`);
      if (!isPlaying) {
        audioRef.current.play().catch((err: any) => {
          log.error(`Failed to resume playback: ${err.message}`, err);
          setError(`Playback failed: ${err.message}`);
        });
        setIsPlaying(true);
      }
      return;
    }

    log.info(`Playing track: "${track.title}" (${track.category})`, track.embed_url);
    setCurrentTrack(track);
    
    // Set source and attempt playback
    audioRef.current.src = track.embed_url;
    
    audioRef.current.play().catch((err: any) => {
      log.error(`Failed to play "${track.title}": ${err.message}`, err);
      setError(`Failed to play "${track.title}": ${err.message}`);
    });
    
    setIsPlaying(true);
    
    // Update index if in playlist
    const idx = playlist.findIndex(t => t._id === track._id);
    if (idx !== -1) setCurrentIndex(idx);
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
    if (!activityType) {
      log.warn('playSmart called with empty activityType');
      return;
    }
    
    // If library still loading, retry
    if (loading) {
      log.info(`Library loading, retrying playSmart for activity: ${activityType}`);
      setTimeout(() => playSmart(activityType), 1500);
      return;
    }

    if (!Array.isArray(allTracks) || allTracks.length === 0) {
      log.error('No tracks available for playSmart', { trackCount: allTracks.length });
      setError('No music tracks available. Please refresh and try again.');
      return;
    }
    
    // Normalize activity type
    const activity = activityType.toLowerCase();
    
    log.info(`smartPlay searching for activity: ${activity}`);
    
    // Find matching tracks based on category or activity_type in DB
    let filtered = allTracks.filter(t => 
      t.activity_type?.toLowerCase() === activity || 
      t.category?.toLowerCase().includes(activity)
    );

    log.info(`Found ${filtered.length} track(s) for activity "${activity}"`);

    // Fallback logic if no exact activity match
    if (filtered.length === 0) {
      if (['coding', 'debugging', 'testing', 'refactoring'].includes(activity)) {
        filtered = allTracks.filter(t => t.category === 'lofi');
        log.info(`Fallback: using ${filtered.length} lofi track(s)`);
      } else if (['writing', 'documentation', 'reading'].includes(activity)) {
        filtered = allTracks.filter(t => t.category === 'ambient');
        log.info(`Fallback: using ${filtered.length} ambient track(s)`);
      } else {
        filtered = allTracks.length > 0 ? [allTracks[Math.floor(Math.random() * allTracks.length)]] : [];
        log.info(`Fallback: using random track`);
      }
    }

    if (filtered.length > 0) {
      log.info(`Playing from ${filtered.length} track(s)`);
      setPlaylist(filtered);
      playTrack(filtered[0]);
    } else {
      log.error('No tracks found even with fallback logic');
      setError('No matching music found for this activity.');
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
    <AudioReactContext.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      progress,
      duration,
      error,
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
    </AudioReactContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioReactContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
