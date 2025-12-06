
import React, { createContext, useContext, useState, ReactNode } from 'react';

import { PlayerState, Song } from '../types';
import { searchYouTube } from '../services/youtubeService';

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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

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

  const playSong = (song: Song, newQueue?: Song[]) => {
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
      playPrevious
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
