import React from 'react';
import { Play, Plus, MessageSquareQuote, MoreHorizontal, ListPlus } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
    song: Song;
    onClick: () => void;
    onPlay: (e: React.MouseEvent) => void;
    onAddToPlaylist?: (e: React.MouseEvent) => void;
    onViewLyrics?: (e: React.MouseEvent) => void;
    onAddToQueue?: (e: React.MouseEvent) => void;
    variant?: 'fixed' | 'responsive';
}

export const SongCard: React.FC<SongCardProps> = ({ song, onClick, onPlay, onAddToPlaylist, onViewLyrics, onAddToQueue, variant = 'fixed' }) => {
    const widthClass = variant === 'fixed' ? 'flex-none w-44 sm:w-48 snap-start' : 'w-full';

    return (
        <div
            className={`group relative ${widthClass} cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]`}
            onClick={onClick}
        >
            {/* Image Container - Enhanced */}
            <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-2xl shadow-xl bg-neutral-800 border border-white/5 group-hover:border-white/10 transition-all duration-300">
                <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient Overlay - Always visible with subtle effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>

                {/* Hover Overlay - Enhanced */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end justify-between p-4">
                    {/* Play Button - Larger and more prominent */}
                    <button
                        onClick={onPlay}
                        className="w-12 h-12 rounded-full bg-[#FA2D48] backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl"
                        aria-label="Play song"
                    >
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                    </button>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        {onAddToQueue && (
                            <button
                                onClick={onAddToQueue}
                                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 hover:scale-110 active:scale-95 transition-all border border-white/10"
                                title="Add to Queue"
                            >
                                <ListPlus size={16} className="text-white" />
                            </button>
                        )}
                        {onViewLyrics && (
                            <button
                                onClick={onViewLyrics}
                                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 hover:scale-110 active:scale-95 transition-all border border-white/10"
                                title="View Lyrics"
                            >
                                <MessageSquareQuote size={16} className="text-white" />
                            </button>
                        )}
                        <button
                            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 hover:scale-110 active:scale-95 transition-all border border-white/10"
                            title="More options"
                        >
                            <MoreHorizontal size={16} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Duration Badge - Positioned at top-right */}
                {song.duration && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-xs font-medium">{song.duration}</span>
                    </div>
                )}
            </div>

            {/* Info - Enhanced Typography */}
            <div className="space-y-1 px-1">
                <h3 className="text-white text-[15px] font-semibold truncate leading-tight group-hover:text-[#FA2D48] transition-colors duration-200">
                    {song.title}
                </h3>
                <p className="text-neutral-400 text-[13px] truncate group-hover:text-neutral-300 transition-colors duration-200">
                    {song.artist}
                </p>
            </div>
        </div>
    );
};
