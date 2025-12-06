
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';

export const ListenNow: React.FC = () => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [trending, setTrending] = useState<Song[]>([]);
    
    useEffect(() => {
        getTrendingVideos().then(setTrending);
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

    const Sections = ({ title, songs }: { title: string, songs: Song[] }) => (
        <div className="mb-8">
            <h2 className="text-[22px] font-bold text-white mb-4 px-5">{title}</h2>
            <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar">
                {songs.map((song) => (
                    <SongCard
                        key={song.id}
                        song={song}
                        onClick={() => playSong(song)}
                        onPlay={(e) => { e.stopPropagation(); playSong(song); }}
                        onViewLyrics={(e) => { e.stopPropagation(); playSong(song); setLyricsVisible(true); }}
                        onAddToQueue={(e) => { e.stopPropagation(); addToQueue(song); }}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000000] pb-32">
             <div className="pt-4 md:pt-10 px-5 sticky top-0 z-20 bg-[#000000]/90 backdrop-blur-xl pb-2 border-b border-white/5 flex justify-between items-end">
                <div>
                     <p className="text-gray-400 font-semibold text-xs uppercase mb-1">{dateStr}</p>
                     <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Listen Now</h1>
                </div>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10 mb-1">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                 </div>
            </div>

            <div className="mt-6">
                <Sections title="Top Picks" songs={trending} />
                <Sections title="Heavy Rotation" songs={[...trending].reverse()} />
                <Sections title="Jump Back In" songs={trending.slice(0, 5)} />
            </div>
        </div>
    );
};
