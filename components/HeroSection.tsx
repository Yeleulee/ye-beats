import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Song } from '../types';

interface HeroSectionProps {
    featuredSongs: Song[];
    onPlay: (song: Song) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ featuredSongs, onPlay }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (featuredSongs.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredSongs.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [featuredSongs]);

    if (!featuredSongs.length) return null;

    const currentSong = featuredSongs[currentIndex];

    return (
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[400px] overflow-hidden rounded-2xl mb-8 group">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-110"
                style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-[50px] bg-black/30" />
            </div>

            {/* Content Content */}
            <div className="absolute inset-0 flex items-end p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row gap-6 items-end sm:items-center w-full max-w-5xl mx-auto">
                    {/* Album Art */}
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 shrink-0 shadow-2xl rounded-lg overflow-hidden transform transition-transform duration-500 hover:scale-105">
                        <img
                            src={currentSong.coverUrl}
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 space-y-2 sm:space-y-4 mb-2">
                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white/90 uppercase tracking-wider">
                            Featured Track
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-none line-clamp-2">
                            {currentSong.title}
                        </h1>
                        <p className="text-lg sm:text-xl text-white/80 font-medium">
                            {currentSong.artist}
                        </p>

                        <div className="pt-2 flex gap-4">
                            <button
                                onClick={() => onPlay(currentSong)}
                                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-500/30"
                            >
                                <Play size={20} fill="currentColor" />
                                Play Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-10 flex gap-2">
                {featuredSongs.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
