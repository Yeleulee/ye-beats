
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { PlayerState, Song } from '../types';
import { searchYouTube } from '../services/youtubeService';

// Listening History Interface
export interface ListeningHistoryEntry {
  song: Song;
  playedAt: number; // timestamp
  playCount: number;
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
  setProgress: (val: number) => void;
  setDuration: (val: number) => void;
  seekTo: (val: number) => void;
  clearSeekRequest: () => void;
  setPlaying: (isPlaying: boolean) => void;
  volume: number;
  setVolume: (val: number) => void;
  toggleVideoMode: () => void;
  toggleLyrics: () => void;
  setLyricsVisible: (visible: boolean) => void;
  addToQueue: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
  listeningHistory: ListeningHistoryEntry[];
  getRecentArtists: () => string[];
  getMostPlayedGenres: () => string[];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Utility functions for history management
const HISTORY_KEY = 'ye-beats-listening-history';
const MAX_HISTORY_SIZE = 100;

const saveHistory = (history: ListeningHistoryEntry[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_SIZE)));
  } catch (error) {
    console.error('Failed to save listening history:', error);
  }
};

const loadHistory = (): ListeningHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load listening history:', error);
    return [];
  }
};

const addToHistory = (song: Song, currentHistory: ListeningHistoryEntry[]): ListeningHistoryEntry[] => {
  const now = Date.now();
  const existingIndex = currentHistory.findIndex(entry => entry.song.id === song.id);
  
  if (existingIndex !== -1) {
    // Update existing entry
    const updatedHistory = [...currentHistory];
    updatedHistory[existingIndex] = {
      ...updatedHistory[existingIndex],
      playedAt: now,
      playCount: updatedHistory[existingIndex].playCount + 1
    };
    return updatedHistory;
  } else {
    // Add new entry at the beginning
    return [{
      song,
      playedAt: now,
      playCount: 1
    }, ...currentHistory];
  }
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    isMinimized: true,
    queue: [],
    progress: 0,
    duration: 0,
    seekRequest: null,
    videoMode: false,
    isLyricsVisible: false,
  });

  const [volume, setVolume] = useState(100);
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    const history = loadHistory();
    setListeningHistory(history);
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    if (listeningHistory.length > 0) {
      saveHistory(listeningHistory);
    }
  }, [listeningHistory]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    // Track in listening history
    setListeningHistory(prev => addToHistory(song, prev));
    
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      isMinimized: false,
      progress: 0,
      seekRequest: 0,
      queue: newQueue || prev.queue, // Use new queue if provided, else keep existing
    }));
  };

  const addToQueue = (song: Song) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, song]
    }));
  };

  // Get recent artists from history
  const getRecentArtists = (): string[] => {
    const artists = listeningHistory
      .slice(0, 20) // Last 20 songs
      .map(entry => entry.song.artist)
      .filter((artist, index, self) => self.indexOf(artist) === index); // Unique artists
    return artists.slice(0, 10); // Top 10 unique artists
  };

  // Get most played genres (extract from artist/album info)
  const getMostPlayedGenres = (): string[] => {
    // For now, we'll extract keywords from album names
    // In a real app, you'd have genre metadata
    const genreKeywords = [
      'pop', 'rock', 'hip-hop', 'rap', 'r&b', 'rnb', 'jazz', 'classical',
      'electronic', 'edm', 'country', 'folk', 'indie', 'alternative',
      'reggae', 'latin', 'afrobeat', 'k-pop', 'soul'
    ];
    
    const albumTexts = listeningHistory
      .map(entry => `${entry.song.album} ${entry.song.artist}`.toLowerCase());
    
    const genreCounts: Record<string, number> = {};
    albumTexts.forEach(text => {
      genreKeywords.forEach(genre => {
        if (text.includes(genre)) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        }
      });
    });
    
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  };


  const playNext = async () => {
    if (state.queue.length > 0) {
      setState(prev => {
        const nextSong = prev.queue[0];
        const newQueue = prev.queue.slice(1);
        return {
          ...prev,
          currentSong: nextSong,
          queue: newQueue,
          progress: 0,
          seekRequest: 0,
          isPlaying: true,
        };
      });
    } else {
      // Auto-play / Shuffle Billboard Logic
      try {
        console.log("Queue empty, fetching Billboard Top 10...");
        const songs = await searchYouTube("Billboard Hot 100 Top 10");
        if (songs.length > 0) {
          // Shuffle the songs
          const shuffled = [...songs].sort(() => 0.5 - Math.random());
          playSong(shuffled[0], shuffled.slice(1));
        }
      } catch (error) {
        console.error("Failed to fetch autoplay songs", error);
      }
    }
  };

  const playPrevious = () => {
    // For now, just restart the song if > 3 seconds, otherwise we need history tracking
    setState(prev => ({
      ...prev,
      seekRequest: 0,
      progress: 0
    }));
  };

  const togglePlay = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const setPlaying = (isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
  };

  const minimizePlayer = () => {
    setState(prev => ({ ...prev, isMinimized: true }));
  };

  const maximizePlayer = () => {
    setState(prev => ({ ...prev, isMinimized: false }));
  };

  const setProgress = (val: number) => {
    setState(prev => ({ ...prev, progress: val }));
  };

  const setDuration = (val: number) => {
    setState(prev => ({ ...prev, duration: val }));
  };

  const seekTo = (val: number) => {
    setState(prev => ({ ...prev, seekRequest: val }));
  };

  const clearSeekRequest = () => {
    setState(prev => ({ ...prev, seekRequest: null }));
  };

  const toggleVideoMode = () => {
    setState(prev => ({ ...prev, videoMode: !prev.videoMode }));
  };

  const toggleLyrics = () => {
    setState(prev => ({ ...prev, isLyricsVisible: !prev.isLyricsVisible }));
  };

  const setLyricsVisible = (visible: boolean) => {
    setState(prev => ({ ...prev, isLyricsVisible: visible }));
  };

  return (
    <PlayerContext.Provider value={{
      ...state,
      playSong,
      togglePlay,
      setPlaying,
      minimizePlayer,
      maximizePlayer,
      setProgress,
      setDuration,
      seekTo,
      clearSeekRequest,
      volume,
      setVolume,
      toggleVideoMode,
      toggleLyrics,
      setLyricsVisible,
      addToQueue,
      playNext,
      playPrevious,
      listeningHistory,
      getRecentArtists,
      getMostPlayedGenres
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
