import React from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { Song } from '../types';

interface ArtistWithSongsProps {
    artist: string;
    artistImage: string;
    songs: Song[];
    onPlaySong: (song: Song) => void;
    onPlayAll: () => void;
}

export const ArtistWithSongs: React.FC<ArtistWithSongsProps> = ({ 
    artist, 
    artistImage, 
    songs, 
    onPlaySong,
    onPlayAll 
}) => {
    return (
        <div className="mb-8 border-b border-white/5 pb-8">
            {/* Artist Header */}
            <div className="flex items-center gap-4 mb-4 px-5">
                {/* Circular Artist Image */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden shadow-lg bg-neutral-800 border border-white/5">
                        <img
                            src={artistImage}
                            alt={artist}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
                
                {/* Artist Info & Play Button */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-[19px] font-bold truncate">{artist}</h3>
                    <p className="text-gray-400 text-[14px]">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
                </div>
                
                {/* Play All Button */}
                <button
                    onClick={onPlayAll}
                    className="w-10 h-10 rounded-full bg-[#FA2D48] flex items-center justify-center hover:bg-[#ff3d58] active:scale-95 transition-all shadow-lg"
                >
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                </button>
            </div>

            {/* Songs List - Horizontal Scroll */}
            <div className="flex overflow-x-auto gap-4 px-5 no-scrollbar snap-x scroll-pl-5">
                {songs.slice(0, 5).map((song, index) => (
                    <div
                        key={song.id || index}
                        onClick={() => onPlaySong(song)}
                        className="group flex-none w-40 snap-start cursor-pointer"
                    >
                        {/* Song Artwork */}
                        <div className="relative aspect-square w-full mb-2 overflow-hidden rounded-lg shadow-md bg-neutral-800">
                            <img
                                src={song.coverUrl}
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                    <Play size={16} fill="black" className="text-black ml-0.5" />
                                </div>
                            </div>
                            
                            {/* Track Number Badge */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white text-xs font-bold">
                                #{index + 1}
                            </div>
                        </div>
                        
                        {/* Song Info */}
                        <div className="space-y-0.5">
                            <h4 className="text-white text-[14px] font-medium truncate leading-tight group-hover:text-[#FA2D48] transition-colors">
                                {song.title}
                            </h4>
                            <p className="text-neutral-400 text-[12px] truncate">
                                {song.album || 'Single'}
                            </p>
                        </div>
                    </div>
                ))}
                
                {/* See All Card (if more than 5 songs) */}
                {songs.length > 5 && (
                    <div className="flex-none w-40 snap-start">
                        <div className="aspect-square w-full mb-2 rounded-lg bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <MoreVertical size={24} className="text-gray-400 mb-1" />
                            <span className="text-white text-[14px] font-medium">See All</span>
                            <span className="text-gray-400 text-[12px]">{songs.length - 5} more</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
