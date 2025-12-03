
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlayerState, Song } from '../types';

interface PlayerContextType extends PlayerState {
  playSong: (song: Song) => void;
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
  });

  const [volume, setVolume] = useState(100);

  const playSong = (song: Song) => {
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      isMinimized: false, // Auto open full player
      progress: 0,
      seekRequest: 0, // Reset position
      // Keep previous video mode or reset? Let's keep it for continuity
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
        toggleVideoMode
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
