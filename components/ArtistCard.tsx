import React from 'react';
import { Play } from 'lucide-react';
import { Song } from '../types';

interface ArtistCardProps {
    song: Song;
    onClick: () => void;
    onPlay?: (e: React.MouseEvent) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ song, onClick, onPlay }) => {
    return (
        <div
            className="group flex-none w-32 md:w-40 snap-start cursor-pointer"
            onClick={onClick}
        >
            {/* Circular Artist Image */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-3">
                <div className="w-full h-full rounded-full overflow-hidden shadow-xl bg-neutral-800 border border-white/5">
                    <img
                        src={song.coverUrl}
                        alt={song.artist}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlay?.(e);
                        }}
                        className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                    >
                        <Play size={20} fill="black" className="text-black ml-1" />
                    </button>
                </div>
            </div>

            {/* Artist Name */}
            <div className="text-center px-1">
                <h3 className="text-white text-[15px] font-medium truncate leading-tight group-hover:text-[#FA2D48] transition-colors">
                    {song.artist}
                </h3>
            </div>
        </div>
    );
};
