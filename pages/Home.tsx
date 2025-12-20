
import React, { useEffect, useState } from 'react';
import { Play, Shuffle, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube, getBillboardTopSongs } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';
import { ArtistWithSongs } from '../components/ArtistWithSongs';

interface Props {
    onSearchPress: () => void;
}

// Helper function to group songs by artist
const groupSongsByArtist = (songs: Song[]) => {
    const grouped: { [artist: string]: Song[] } = {};
    
    songs.forEach(song => {
        const artistName = song.artist;
        if (!grouped[artistName]) {
            grouped[artistName] = [];
        }
        grouped[artistName].push(song);
    });
    
    return Object.entries(grouped)
        .map(([artist, songs]) => ({ artist, songs }))
        .sort((a, b) => b.songs.length - a.songs.length);
};

export const Home: React.FC<Props> = ({ onSearchPress }) => {
    const { playSong, setLyricsVisible, addToQueue, listeningHistory } = usePlayer();
    
    // Data states
    const [billboardSongs, setBillboardSongs] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    const [forYou, setForYou] = useState<Song[]>([]);
    
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Get current date and greeting
    const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Fetch data on mount
    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [trendingData, billboardData] = await Promise.all([
                    getTrendingVideos(),
                    getBillboardTopSongs()
                ]);
                
                setTrending(trendingData);
                setBillboardSongs(billboardData);

                // For You section - personalized or curated
                const forYouData = await searchYouTube("trending music 2024 2025 hits");
                setForYou(forYouData);
            } catch (err) {
                console.error("Failed to load content", err);
                setError("Failed to load music. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, []);

    // Action handlers
    const handleShufflePlay = async () => {
        try {
            if (billboardSongs.length > 0) {
                const shuffled = [...billboardSongs].sort(() => 0.5 - Math.random());
                playSong(shuffled[0], shuffled.slice(1));
            } else {
                const songs = await getBillboardTopSongs();
                if (songs.length > 0) {
                    const shuffled = [...songs].sort(() => 0.5 - Math.random());
                    playSong(shuffled[0], shuffled.slice(1));
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePlayTop = () => {
        if (billboardSongs.length > 0) {
            playSong(billboardSongs[0], billboardSongs.slice(1));
        } else if (trending.length > 0) {
            playSong(trending[0], trending.slice(1));
        }
    };

    // Billboard Section - Artists with their songs
    const BillboardSection = ({ title, songs }: { title: string; songs: Song[] }) => {
        const groupedArtists = groupSongsByArtist(songs);
        
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between px-5 mb-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button className="text-[#FA2D48] text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity">
                        See All
                        <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {groupedArtists.slice(0, 5).map((group) => (
                        <ArtistWithSongs
                            key={group.artist}
                            artist={group.artist}
                            artistImage={group.songs[0].coverUrl}
                            songs={group.songs}
                            onPlaySong={(song) => playSong(song)}
                            onPlayAll={() => playSong(group.songs[0], group.songs.slice(1))}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Song Section Component
    const SongSection = ({ title, songs, subtitle }: { title: string; songs: Song[]; subtitle?: string }) => (
        <div className="mb-10">
            <div className="flex items-center justify-between px-5 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                <button className="text-[#FA2D48] text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity">
                    See All
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
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

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="px-5 space-y-10 animate-pulse">
            {/* Billboard Skeleton */}
            <div>
                <div className="h-7 w-48 bg-white/5 rounded mb-4" />
                <div className="flex gap-5 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-none w-32 md:w-40 flex flex-col items-center gap-3">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5" />
                            <div className="w-24 h-4 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Songs Skeleton */}
            <div>
                <div className="h-7 w-48 bg-white/5 rounded mb-4" />
                <div className="flex gap-5 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-none w-[140px] md:w-[180px]">
                            <div className="aspect-square rounded-lg bg-white/5 mb-3" />
                            <div className="w-full h-4 bg-white/5 rounded mb-2" />
                            <div className="w-2/3 h-4 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000000] pb-32">
            {/* Sticky Top Bar with Date */}
            <div className="px-5 pt-4 pb-2 sticky top-0 z-30 bg-[#000000]/95 backdrop-blur-xl border-b border-white/5 flex justify-between items-center transition-all duration-300">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">{dateStr}</span>
                <button
                    onClick={onSearchPress}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                >
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
                </button>
            </div>

            {/* Hero Header Area with Greeting */}
            <div className="px-5 pt-6 pb-8 bg-gradient-to-b from-white/5 to-transparent">
                {/* Greeting */}
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                    {getGreeting()}
                </h1>
                <p className="text-gray-400 text-base mb-6">
                    {listeningHistory.length > 0 
                        ? `You've played ${listeningHistory.length} songs recently`
                        : "Discover new music today"
                    }
                </p>
                
                {/* Primary Action Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={handlePlayTop}
                        disabled={isLoading}
                        className="flex-1 bg-white text-black h-14 rounded-full font-bold text-[18px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play fill="black" size={24} />
                        Play
                    </button>
                    <button 
                        onClick={handleShufflePlay}
                        disabled={isLoading}
                        className="flex-1 bg-[#1C1C1E] text-[#FA2D48] h-14 rounded-full font-bold text-[18px] flex items-center justify-center gap-2 hover:bg-[#2C2C2E] active:scale-95 transition-all shadow-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Shuffle size={24} />
                        Shuffle
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-2 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FA2D48] rounded-full text-white font-medium hover:bg-[#ff4560] transition-colors"
                        >
                            <RefreshCw size={18} />
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Billboard Top Artists Section */}
                        {billboardSongs.length > 0 && (
                            <BillboardSection title="Billboard Top 100" songs={billboardSongs} />
                        )}

                        {/* Heavy Rotation - Your most played */}
                        {trending.length > 0 && (
                            <SongSection 
                                title="Heavy Rotation" 
                                subtitle="What's trending right now"
                                songs={trending} 
                            />
                        )}

                        {/* For You Section */}
                        {forYou.length > 0 && (
                            <SongSection 
                                title="For You" 
                                subtitle="Personalized picks"
                                songs={forYou} 
                            />
                        )}

                        {/* Recently Played - Only if user has history */}
                        {listeningHistory.length > 0 && (
                            <div className="mb-10">
                                <div className="flex items-center justify-between px-5 mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Recently Played</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Continue where you left off</p>
                                    </div>
                                    <button className="text-[#FA2D48] text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity">
                                        See All
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                    {listeningHistory.slice(0, 10).map((entry, index) => (
                                        <div
                                            key={entry.song.id + index}
                                            onClick={() => playSong(entry.song)}
                                            className="snap-start flex-none w-[140px] group cursor-pointer"
                                        >
                                            {/* Circular Image */}
                                            <div className="relative w-[140px] h-[140px] mb-3">
                                                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
                                                    <img
                                                        src={entry.song.coverUrl}
                                                        alt={entry.song.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                    {/* Play Overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                                                        <div className="w-14 h-14 bg-[#FA2D48] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                                                            <Play size={24} fill="white" className="text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Play count badge */}
                                                {entry.playCount > 1 && (
                                                    <div className="absolute -top-1 -right-1 bg-[#FA2D48] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-black">
                                                        {entry.playCount}x
                                                    </div>
                                                )}
                                            </div>

                                            {/* Song Info */}
                                            <div className="text-center">
                                                <h4 className="text-white font-semibold text-[14px] truncate mb-1 group-hover:text-[#FA2D48] transition-colors">
                                                    {entry.song.title.length > 20 
                                                        ? entry.song.title.substring(0, 20) + '...' 
                                                        : entry.song.title
                                                    }
                                                </h4>
                                                <p className="text-gray-400 text-[12px] truncate">
                                                    {entry.song.artist}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Picks - Mixed content */}
                        {trending.length > 0 && (
                            <SongSection 
                                title="Top Picks" 
                                subtitle="Editor's choice"
                                songs={[...trending].reverse().slice(0, 12)} 
                            />
                        )}

                        {/* Empty State */}
                        {billboardSongs.length === 0 && trending.length === 0 && (
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
