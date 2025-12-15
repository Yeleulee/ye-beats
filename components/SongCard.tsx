import React, { useState } from 'react';
import { Play, Plus, MessageSquareQuote, MoreHorizontal, ListPlus, Sparkles } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
    song: Song;
    onClick: () => void;
    onPlay: (e: React.MouseEvent) => void;
    onAddToPlaylist?: (e: React.MouseEvent) => void;
    onViewLyrics?: (e: React.MouseEvent) => void;
    onAddToQueue?: (e: React.MouseEvent) => void;
    variant?: 'fixed' | 'responsive' | 'premium' | 'compact';
    showPopularity?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ 
    song, 
    onClick, 
    onPlay, 
    onAddToPlaylist, 
    onViewLyrics, 
    onAddToQueue, 
    variant = 'fixed',
    showPopularity = false 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const widthClass = variant === 'fixed' 
        ? 'flex-none w-44 sm:w-48 snap-start' 
        : variant === 'compact'
        ? 'flex-none w-36 sm:w-40 snap-start'
        : variant === 'premium'
        ? 'flex-none w-52 sm:w-56 snap-start'
        : 'w-full';

    // Generate random gradient for each card (deterministic based on song ID)
    const gradients = [
        'from-purple-500/20 via-pink-500/10 to-transparent',
        'from-blue-500/20 via-cyan-500/10 to-transparent',
        'from-red-500/20 via-orange-500/10 to-transparent',
        'from-green-500/20 via-teal-500/10 to-transparent',
        'from-yellow-500/20 via-amber-500/10 to-transparent',
        'from-indigo-500/20 via-purple-500/10 to-transparent'
    ];
    
    const cardGradient = gradients[parseInt(song.id || '0') % gradients.length];

    return (
        <div
            className={`group relative ${widthClass} cursor-pointer`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow Effect on Hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FA2D48]/0 via-purple-500/0 to-blue-500/0 group-hover:from-[#FA2D48]/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            
            <div className="transform transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:-translate-y-2 active:scale-[0.98]">
                {/* Image Container - Premium Design */}
                <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-2xl shadow-2xl bg-neutral-900 border border-white/10 group-hover:border-white/20 transition-all duration-500">
                    {/* Album Art */}
                    <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                        loading="lazy"
                    />

                    {/* Dynamic Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay`}></div>

                    {/* Base Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                    {/* Glassmorphism Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                        {/* Sparkle Effect */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                            <Sparkles size={16} className="text-white/60 animate-pulse" />
                        </div>
                    </div>

                    {/* Central Play Button with Glow */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="relative">
                            {/* Glow rings */}
                            <div className="absolute inset-0 bg-[#FA2D48] rounded-full blur-2xl opacity-50 scale-150 animate-pulse"></div>
                            <div className="absolute inset-0 bg-[#FA2D48] rounded-full blur-xl opacity-40 scale-125"></div>
                            
                            {/* Play button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlay(e);
                                }}
                                className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#FA2D48] to-[#ff1744] flex items-center justify-center scale-75 group-hover:scale-100 hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl ring-4 ring-white/10"
                                aria-label="Play song"
                            >
                                <Play size={24} fill="white" className="text-white ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            {onAddToQueue && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToQueue(e);
                                    }}
                                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all"
                                    title="Add to Queue"
                                >
                                    <ListPlus size={16} className="text-white" />
                                </button>
                            )}
                            {onViewLyrics && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewLyrics(e);
                                    }}
                                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all"
                                    title="View Lyrics"
                                >
                                    <MessageSquareQuote size={16} className="text-white" />
                                </button>
                            )}
                        </div>
                        
                        {/* More Options */}
                        <button
                            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all"
                            title="More options"
                        >
                            <MoreHorizontal size={16} className="text-white" />
                        </button>
                    </div>

                    {/* Duration Badge - Top Right */}
                    {song.duration && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 transition-all duration-300 group-hover:bg-black/50">
                            <span className="text-white text-xs font-semibold tabular-nums">{song.duration}</span>
                        </div>
                    )}

                    {/* Popularity Indicator */}
                    {showPopularity && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FA2D48]/80 to-purple-500/80 backdrop-blur-md rounded-lg">
                                <Sparkles size={12} className="text-white" />
                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Trending</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info - Enhanced with Premium Styling */}
                <div className="space-y-1.5 px-1">
                    <h3 className="text-white text-[15px] font-bold truncate leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FA2D48] group-hover:to-purple-400 transition-all duration-300">
                        {song.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-neutral-400 text-[13px] truncate group-hover:text-neutral-200 transition-colors duration-200 flex-1">
                            {song.artist}
                        </p>
                        {/* Animated Sound Wave Indicator on Hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="w-0.5 h-2 bg-[#FA2D48] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-0.5 h-3 bg-[#FA2D48] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-0.5 h-2 bg-[#FA2D48] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
