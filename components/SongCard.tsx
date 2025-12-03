import React from 'react';
import { Play, Plus, MessageSquareQuote, MoreHorizontal } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
    song: Song;
    onClick: () => void;
    onPlay: (e: React.MouseEvent) => void;
    onAddToPlaylist?: (e: React.MouseEvent) => void;
    onViewLyrics?: (e: React.MouseEvent) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onClick, onPlay, onAddToPlaylist, onViewLyrics }) => {
    return (
        <div
            className="group relative flex-none w-44 sm:w-48 snap-start cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            onClick={onClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-xl shadow-lg bg-neutral-800">
                <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <button
                        onClick={onPlay}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all shadow-lg"
                    >
                        <Play size={20} fill="white" className="text-white ml-1" />
                    </button>

                    <div className="flex gap-2">
                        {onViewLyrics && (
                            <button
                                onClick={onViewLyrics}
                                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all"
                                title="View Lyrics"
                            >
                                <MessageSquareQuote size={16} className="text-white" />
                            </button>
                        )}
                        <button
                            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all"
                        >
                            <MoreHorizontal size={16} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-1">
                <h3 className="text-white text-[15px] font-medium truncate leading-tight group-hover:text-red-500 transition-colors">
                    {song.title}
                </h3>
                <p className="text-neutral-400 text-[13px] truncate">
                    {song.artist}
                </p>
            </div>
        </div>
    );
};
