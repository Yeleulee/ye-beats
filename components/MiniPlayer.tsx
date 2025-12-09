
import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { THEME } from '../constants';

export const MiniPlayer: React.FC = () => {
  const { currentSong, isPlaying, togglePlay, maximizePlayer, progress, duration } = usePlayer();

  if (!currentSong) return null;

  const percent = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-screen-xl rounded-lg p-2 flex items-center shadow-2xl z-[65] cursor-pointer overflow-hidden backdrop-blur-xl bg-[#212121]"
      onClick={maximizePlayer}
      style={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-red-600 transition-all duration-500 ease-linear"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <img
        src={currentSong.coverUrl}
        alt={currentSong.title}
        className="w-10 h-10 rounded-md object-cover mr-3"
      />

      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate">{currentSong.title}</h4>
        <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
      </div>

      <button
        className="p-3 ml-2 text-white active:scale-90 transition-transform touch-manipulation"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
      </button>
    </div>
  );
};
