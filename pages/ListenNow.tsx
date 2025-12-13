
import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Mic2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube, getBillboardTopSongs } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';



export const ListenNow: React.FC = () => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [topArtistsData, setTopArtistsData] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            try {
                const [trendingData, billboardData] = await Promise.all([
                    getTrendingVideos(),
                    getBillboardTopSongs()
                ]);
                
                setTrending(trendingData);
                setTopArtistsData(billboardData);
            } catch (error) {
                console.error("Failed to load content", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
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
            const songs = await getBillboardTopSongs();
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

    // Billboard Artists Section with circular avatars
    const BillboardArtistsSection = ({ title, songs }: { title: string, songs: Song[] }) => (
        <div className="mb-10">
            <div className="flex items-center justify-between px-5 mb-4">
                <h2 className="text-[22px] font-bold text-white">{title}</h2>
                <button className="text-[#FA2D48] text-sm font-medium">See All</button>
            </div>
            <div className="flex overflow-x-auto gap-5 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                {songs.map((song, i) => (
                    <ArtistCard
                        key={song.id || i}
                        song={song}
                        onClick={() => playSong(song)}
                        onPlay={(e) => { e.stopPropagation(); playSong(song); }}
                    />
                ))}
            </div>
        </div>
    );

    const Sections = ({ title, songs }: { title: string, songs: Song[] }) => (
        <div className="mb-10">
            <div className="flex items-center justify-between px-5 mb-4">
                <h2 className="text-[22px] font-bold text-white">{title}</h2>
                <button className="text-[#FA2D48] text-sm font-medium">See All</button>
            </div>
            <div className="flex overflow-x-auto gap-5 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                {songs.map((song, i) => (
                    <SongCard
                        key={song.id || i}
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
             {/* Sticky Top Bar - Minimal */}
             <div className="px-5 pt-4 pb-2 sticky top-0 z-30 bg-[#000000]/95 backdrop-blur-xl border-b border-white/5 flex justify-between items-center transition-all duration-300">
                 <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">{dateStr}</span>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                 </div>
             </div>

            {/* Hero Header Area */}
            <div className="px-5 pt-4 pb-8 bg-gradient-to-b from-white/5 to-transparent">
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 mt-2">{getGreeting()}</h1>
                 
                 {/* Primary Actions - Integrated into Header */}
                 <div className="flex gap-4">
                    <button 
                        onClick={handlePlayTop}
                        className="flex-1 bg-white text-black h-14 rounded-full font-bold text-[18px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-white/20"
                    >
                        <Play fill="black" size={24} />
                        Play
                    </button>
                    <button 
                        onClick={handleShufflePlay}
                        className="flex-1 bg-[#1C1C1E] text-[#FA2D48] h-14 rounded-full font-bold text-[18px] flex items-center justify-center gap-2 hover:bg-[#2C2C2E] active:scale-95 transition-all shadow-lg border border-white/10"
                    >
                        <Shuffle size={24} />
                        Shuffle
                    </button>
                </div>
            </div>

            <div className="mt-2 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {isLoading ? (
                    <div className="px-5 space-y-10">
                        {/* Billboard Skeleton */}
                        <div>
                             <div className="h-7 w-48 bg-white/5 rounded mb-4 animate-pulse" />
                             <div className="flex gap-5 overflow-hidden">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex-none w-32 md:w-40 flex flex-col items-center gap-3">
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 animate-pulse" />
                                        <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                                    </div>
                                ))}
                             </div>
                        </div>
                        {/* Songs Skeleton */}
                        <div>
                             <div className="h-7 w-48 bg-white/5 rounded mb-4 animate-pulse" />
                             <div className="flex gap-5 overflow-hidden">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex-none w-[140px] md:w-[180px]">
                                        <div className="aspect-square rounded-lg bg-white/5 animate-pulse mb-3" />
                                        <div className="w-full h-4 bg-white/5 rounded mb-2 animate-pulse" />
                                        <div className="w-2/3 h-4 bg-white/5 rounded animate-pulse" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {topArtistsData.length > 0 && <BillboardArtistsSection title="Billboard Top 100" songs={topArtistsData} />}
                        {trending.length > 0 && <Sections title="Heavy Rotation" songs={[...trending].reverse()} />}
                        {trending.length > 0 && <Sections title="Top Picks" songs={trending} />}
                        
                        {topArtistsData.length === 0 && trending.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-4">
                                <p className="text-lg">Unable to load music</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white text-sm font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
