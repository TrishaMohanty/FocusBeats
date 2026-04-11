import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { api as apiClient } from '../lib/api';
import { useAuth } from './AuthContext';

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

const DEMO_TRACKS: Track[] = [
  {
    _id: 'demo-1',
    title: 'Flower Cup',
    station: 'Lofi Vibes',
    category: 'lofi',
    focus_level: 'low',
    activity_type: 'coding',
    embed_url: 'http://localhost:5000/music/Lukrembo%20-%20Flower%20Cup%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-2',
    title: 'Midnight',
    station: 'Deep Focus',
    category: 'ambient',
    focus_level: 'high',
    activity_type: 'debugging',
    embed_url: 'http://localhost:5000/music/massobeats%20-%20midnight%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-3',
    title: 'Little Voices',
    station: 'Gentle Flow',
    category: 'lofi',
    focus_level: 'medium',
    activity_type: 'writing',
    embed_url: 'http://localhost:5000/music/Amine%20Maxwell%20-%20Little%20Voices%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-4',
    title: 'A Beautiful Garden',
    station: 'Nature Focus',
    category: 'ambient',
    focus_level: 'low',
    activity_type: 'reading',
    embed_url: 'http://localhost:5000/music/Aventure%20-%20A%20Beautiful%20Garden%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-5',
    title: 'Meditation',
    station: 'Zen Mode',
    category: 'pianos',
    focus_level: 'high',
    activity_type: 'testing',
    embed_url: 'http://localhost:5000/music/Aylex%20-%20Meditation%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-6',
    title: 'Florida Keys',
    station: 'Chill Beats',
    category: 'lofi',
    focus_level: 'medium',
    activity_type: 'planning',
    embed_url: 'http://localhost:5000/music/Hoffy%20Beats%20-%20Florida%20Keys%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-7',
    title: 'Honey Jam',
    station: 'Sweet Focus',
    category: 'lofi',
    focus_level: 'low',
    activity_type: 'documentation',
    embed_url: 'http://localhost:5000/music/massobeats%20-%20honey%20jam%20(freetouse.com).mp3'
  },
  {
    _id: 'demo-8',
    title: 'Peach Prosecco',
    station: 'Sunset Studio',
    category: 'lofi',
    focus_level: 'medium',
    activity_type: 'coding',
    embed_url: 'http://localhost:5000/music/massobeats%20-%20peach%20prosecco%20(freetouse.com).mp3'
  }
];

const AudioReactContext = createContext<AudioContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
  const [allTracks, setAllTracks] = useState<Track[]>(DEMO_TRACKS);
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

    // Initial setup ends here
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

  // Separate effect for loading library when user is authenticated
  useEffect(() => {
    const loadLibrary = async () => {
      if (authLoading) return;
      if (!user) {
        // If not logged in, we stay with DEMO_TRACKS
        setAllTracks(DEMO_TRACKS);
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient.get('/music');
        const fetchedTracks = (Array.isArray(data) ? data : []).map((t: any) => ({
          ...t,
          // Correct relative URLs to absolute URLs using backend base
          embed_url: t.embed_url?.startsWith('/') 
            ? `${API_BASE_URL}${t.embed_url}` 
            : t.embed_url
        }));

        // Combine fetched tracks with demo tracks, avoiding duplicates
        const combined = [...DEMO_TRACKS, ...fetchedTracks.filter(t => !DEMO_TRACKS.some(d => d.title === t.title))];
        setAllTracks(combined);
      } catch (err) {
        console.error('Failed to preload music library:', err);
        // Fallback to demo tracks on error instead of clearing everything
        setAllTracks(DEMO_TRACKS);
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
      
      const isSameTrack = currentTrack?._id === track._id;
      
      if (isSameTrack) {
        if (!isPlaying) {
           audioRef.current.play().catch(console.error);
           setIsPlaying(true);
        }
        return;
      }

      // If already playing something else, fade out or just switch
      let finalUrl = track.embed_url;
      if (finalUrl.startsWith('/')) {
        finalUrl = `${API_BASE_URL}${finalUrl}`;
      }

      audioRef.current.src = finalUrl;
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        // If it's a relative path error or similar, maybe it was missing the base
      });
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
    if (!activityType) return;
    
    // If library still loading, retry once in 1s
    if (loading || (!Array.isArray(allTracks) || allTracks.length === 0)) {
        setTimeout(() => playSmart(activityType), 1500);
        return;
    }
    
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
        filtered = allTracks.filter(t => t.category === 'lofi');
      } else if (['writing', 'documentation', 'reading'].includes(activity)) {
        filtered = allTracks.filter(t => t.category === 'ambient');
      } else {
        filtered = allTracks.length > 0 ? [allTracks[Math.floor(Math.random() * allTracks.length)]] : [];
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
    <AudioReactContext.Provider value={{
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
