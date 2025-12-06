
import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Mic2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube, getPlaylistItems } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';

const BILLBOARD_PLAYLIST_ID = 'PL55713C70DAAD3781'; // Billboard Hot 100 Playlist

interface ArtistCardProps {
    song: Song;
    onClick: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ song, onClick }) => (
    <div 
        className="flex flex-col items-center gap-3 cursor-pointer group w-32 md:w-40 flex-none snap-start"
        onClick={onClick}
    >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg border-2 border-transparent group-hover:border-[#FA2D48] transition-all relative">
             <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play fill="white" className="w-10 h-10 text-white drop-shadow-lg" />
             </div>
        </div>
        <span className="text-white font-semibold text-[15px] text-center truncate w-full">{song.artist}</span>
    </div>
);

export const ListenNow: React.FC = () => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [topArtistsData, setTopArtistsData] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    
    useEffect(() => {
        // Load Trending (Cached automatically by service)
        getTrendingVideos().then(setTrending);

        // Load Billboard Top 100 (Cached automatically by service)
        // This replaces the 20x search calls with 1x playlist call
        const loadBillboard = async () => {
            const data = await getPlaylistItems(BILLBOARD_PLAYLIST_ID);
            setTopArtistsData(data);
        };
        loadBillboard();
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleShufflePlay = async () => {
        try {
            // Use cached playlist items for shuffle
            const songs = await getPlaylistItems(BILLBOARD_PLAYLIST_ID);
            if (songs.length > 0) {
                const shuffled = [...songs].sort(() => 0.5 - Math.random());
                playSong(shuffled[0], shuffled.slice(1));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePlayTop = async () => {
        if (topArtistsData.length > 0) {
            playSong(topArtistsData[0], topArtistsData.slice(1));
        }
    };

    const Sections = ({ title, songs, type = 'song' }: { title: string, songs: Song[], type?: 'song' | 'artist' }) => (
        <div className="mb-10">
            <div className="flex items-center justify-between px-5 mb-4">
                <h2 className="text-[22px] font-bold text-white">{title}</h2>
                <button className="text-[#FA2D48] text-sm font-medium">See All</button>
            </div>
            <div className="flex overflow-x-auto gap-5 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                {songs.map((song, i) => {
                     if (type === 'artist') {
                        return <ArtistCard key={song.id || i} song={song} onClick={() => playSong(song)} />;
                     }
                     return (
                        <SongCard
                            key={song.id || i}
                            song={song}
                            onClick={() => playSong(song)}
                            onPlay={(e) => { e.stopPropagation(); playSong(song); }}
                            onViewLyrics={(e) => { e.stopPropagation(); playSong(song); setLyricsVisible(true); }}
                            onAddToQueue={(e) => { e.stopPropagation(); addToQueue(song); }}
                        />
                     );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000000] pb-32">

            <div className="pt-4 md:pt-10 px-5 sticky top-0 z-20 bg-[#000000]/95 backdrop-blur-xl pb-2 border-b border-white/5 shadow-2xl shadow-black/50">
                <div className="flex justify-between items-end mb-2">
                    <div>
                         <p className="text-gray-400 font-semibold text-xs uppercase mb-1 tracking-wide">{dateStr}</p>
                         <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{getGreeting()}</h1>
                    </div>
                     <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10 mb-1 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                     </div>
                </div>
            </div>

            <div className="mt-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Action Buttons */}
                <div className="flex gap-4 px-5 mb-8">
                    <button 
                        onClick={handlePlayTop}
                        className="flex-1 bg-white text-black h-12 rounded-lg font-semibold text-[17px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-white/10"
                    >
                        <Play fill="black" size={20} />
                        Play
                    </button>
                    <button 
                        onClick={handleShufflePlay}
                        className="flex-1 bg-[#1C1C1E] text-[#FA2D48] h-12 rounded-lg font-semibold text-[17px] flex items-center justify-center gap-2 hover:bg-[#2C2C2E] active:scale-95 transition-all shadow-lg border border-white/5"
                    >
                        <Shuffle size={20} />
                        Shuffle
                    </button>
                </div>
                <Sections title="Billboard Top Artists" songs={topArtistsData} type="artist" />
                <Sections title="Heavy Rotation" songs={[...trending].reverse()} />
                <Sections title="Top Picks" songs={trending} />
            </div>
        </div>
    );
};
