import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Mic2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const DesktopPlayer: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        progress,
        duration,
        maximizePlayer,
        playNext,
        playPrevious,
        volume,
        setVolume
    } = usePlayer();

    if (!currentSong) return null;

    const percent = duration ? (progress / duration) * 100 : 0;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-white/10 px-6 flex items-center justify-between z-50 backdrop-blur-xl">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="relative group cursor-pointer" onClick={maximizePlayer}>
                    <img
                        src={currentSong.coverUrl}
                        alt={currentSong.title}
                        className="w-14 h-14 rounded-md object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Maximize2 size={20} className="text-white" />
                    </div>
                </div>
                <div className="min-w-0">
                    <h4 className="text-white font-medium truncate hover:underline cursor-pointer" onClick={maximizePlayer}>{currentSong.title}</h4>
                    <p className="text-gray-400 text-xs truncate hover:underline cursor-pointer">{currentSong.artist}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center w-[40%] max-w-2xl">
                <div className="flex items-center gap-6 mb-2">
                    <button className="text-neutral-400 hover:text-white transition"><Shuffle size={18} /></button>
                    <button className="text-neutral-300 hover:text-white transition" onClick={playPrevious}><SkipBack size={24} fill="currentColor" /></button>
                    <button
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition active:scale-95"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                        }}
                    >
                        {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="text-black ml-1" />}
                    </button>
                    <button className="text-neutral-300 hover:text-white transition" onClick={playNext}><SkipForward size={24} fill="currentColor" /></button>
                    <button className="text-neutral-400 hover:text-white transition"><Repeat size={18} /></button>
                </div>

                <div className="w-full flex items-center gap-3 text-xs text-neutral-400 font-medium font-mono">
                    <span>{formatTime(progress)}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative">
                        <div
                            className="absolute h-full bg-white rounded-full group-hover:bg-red-500 transition-colors"
                            style={{ width: `${percent}%` }}
                        ></div>
                        <div
                            className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${percent}%` }}
                        ></div>
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end gap-4 w-[30%]">
                <button className="text-neutral-400 hover:text-white transition" onClick={maximizePlayer}><Mic2 size={20} /></button>
                <div className="flex items-center gap-2 w-32 group relative">
                    <Volume2 size={20} className="text-neutral-400 group-hover:text-white transition" />
                    <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative">
                        <div
                            className="absolute h-full bg-white/50 group-hover:bg-white rounded-full transition-colors"
                            style={{ width: `${volume}%` }}
                        ></div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
