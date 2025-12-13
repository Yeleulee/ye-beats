
import React, { useEffect, useState } from 'react';
import { ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube } from '../services/youtubeService';
import { Song } from '../types';
import { HeroSection } from '../components/HeroSection';
import { SongCard } from '../components/SongCard';
import { TopArtistsFeed, ArtistRanking, generateArtistRankings } from '../components/TopArtistsFeed';

interface Props {
    onSearchPress: () => void;
}

const EXPLORE_LINKS = [
    'Spatial Audio',
    'Music Videos',
    'Charts',
    'Browse by Genre',
    'Decades',
    'Moods and Activities'
];

export const Home: React.FC<Props> = ({ onSearchPress }) => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [recommended, setRecommended] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    const [topArtists, setTopArtists] = useState<ArtistRanking[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Sub-view state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categorySongs, setCategorySongs] = useState<Song[]>([]);
    const [loadingCategory, setLoadingCategory] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [recData, trendData] = await Promise.all([
                    searchYouTube("chill lofi beats"),
                    getTrendingVideos(),
                ]);

                setRecommended(recData);
                setTrending(trendData);

                // Generate Top Artists with intelligent ranking
                const curatedArtists = generateArtistRankings([
                    {
                        id: '1',
                        name: 'The Weeknd',
                        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                        genres: ['R&B', 'Pop'],
                        globalPlayCount: 15000000,
                        userListens: 120,
                        topSong: 'Blinding Lights',
                        color: '#E31C23'
                    },
                    {
                        id: '2',
                        name: 'Drake',
                        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
                        genres: ['Hip-Hop', 'Rap'],
                        globalPlayCount: 13500000,
                        userListens: 95,
                        topSong: 'God\'s Plan',
                        color: '#FFA500'
                    },
                    {
                        id: '3',
                        name: 'Taylor Swift',
                        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
                        genres: ['Pop', 'Country'],
                        globalPlayCount: 14000000,
                        userListens: 88,
                        topSong: 'Anti-Hero',
                        color: '#B794F4'
                    },
                    {
                        id: '4',
                        name: 'Bad Bunny',
                        imageUrl: 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=400&h=400&fit=crop',
                        genres: ['Reggaeton', 'Latin'],
                        globalPlayCount: 12000000,
                        userListens: 72,
                        topSong: 'Tití Me Preguntó',
                        color: '#FF6B6B'
                    },
                    {
                        id: '5',
                        name: 'Billie Eilish',
                        imageUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&h=400&fit=crop',
                        genres: ['Alternative', 'Pop'],
                        globalPlayCount: 11500000,
                        userListens: 65,
                        topSong: 'What Was I Made For?',
                        color: '#4ADE80'
                    },
                    {
                        id: '6',
                        name: 'Ed Sheeran',
                        imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
                        genres: ['Pop', 'Folk'],
                        globalPlayCount: 10800000,
                        userListens: 58,
                        topSong: 'Shape of You',
                        color: '#F59E0B'
                    },
                    {
                        id: '7',
                        name: 'Dua Lipa',
                        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
                        genres: ['Pop', 'Dance'],
                        globalPlayCount: 10200000,
                        userListens: 51,
                        topSong: 'Levitating',
                        color: '#EC4899'
                    },
                    {
                        id: '8',
                        name: 'Harry Styles',
                        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                        genres: ['Pop', 'Rock'],
                        globalPlayCount: 9500000,
                        userListens: 44,
                        topSong: 'As It Was',
                        color: '#8B5CF6'
                    },
                    {
                        id: '9',
                        name: 'Ariana Grande',
                        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                        genres: ['Pop', 'R&B'],
                        globalPlayCount: 9200000,
                        userListens: 40,
                        topSong: 'Thank U, Next',
                        color: '#FFC0CB'
                    },
                    {
                        id: '10',
                        name: 'Travis Scott',
                        imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
                        genres: ['Hip-Hop', 'Trap'],
                        globalPlayCount: 8900000,
                        userListens: 37,
                        topSong: 'SICKO MODE',
                        color: '#DC2626'
                    }
                ], {
                    favoriteGenres: ['Pop', 'R&B', 'Hip-Hop'],
                    recentListens: ['1', '2', '3']
                });

                setTopArtists(curatedArtists);
            } catch (e) {
                console.error("Failed to load home data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryClick = async (category: string) => {
        setSelectedCategory(category);
        setLoadingCategory(true);
        try {
            const songs = await searchYouTube(category + " music");
            setCategorySongs(songs);
        } catch (e) {
            console.error("Failed to load category", e);
        } finally {
            setLoadingCategory(false);
        }
    };

    const SkeletonCard = () => (
        <div className="flex-none w-44 sm:w-48 snap-start">
            <div className="aspect-square w-full mb-3 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="h-4 w-32 bg-white/5 rounded mb-2 animate-pulse"></div>
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
        </div>
    );

    const SectionHeader = ({ title, showChevron = true }: { title: string, showChevron?: boolean }) => (
        <div className="flex items-center justify-between px-5 mb-3 group cursor-pointer">
            <h2 className="text-[22px] font-bold text-white tracking-tight flex items-center">
                {title}
                {showChevron && <ChevronRight size={20} className="text-neutral-500 ml-1 opacity-70" />}
            </h2>
        </div>
    );

    const SongSection = ({ title, songs }: { title: string, songs: Song[] }) => (
        <div className="mb-8 border-t border-white/5 pt-6">
            <SectionHeader title={title} />
            <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                {songs.map((song) => (
                    <SongCard
                        key={song.id}
                        song={song}
                        onClick={() => playSong(song)}
                        onPlay={(e) => {
                            e.stopPropagation();
                            playSong(song);
                        }}
                        onViewLyrics={(e) => {
                            e.stopPropagation();
                            playSong(song);
                            setLyricsVisible(true);
                        }}
                        onAddToQueue={(e) => {
                            e.stopPropagation();
                            addToQueue(song);
                        }}
                    />
                ))}
            </div>
        </div>
    );

    // Detail View
    if (selectedCategory) {
         return (
            <div className="pb-32 bg-[#000000] min-h-screen overflow-hidden">
                 <div className="pt-4 md:pt-10 bg-[#000000] sticky top-0 z-20 pb-2 bg-opacity-90 backdrop-blur-xl border-b border-white/5">
                    <div className="px-5 flex items-center gap-2">
                         <button onClick={() => setSelectedCategory(null)} className="flex items-center text-[#FA2D48] text-[17px] -ml-2 pr-2">
                            <ArrowLeft size={22} />
                            Back
                        </button>
                    </div>
                    <div className="px-5 mt-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{selectedCategory}</h1>
                    </div>
                </div>

                <div className="px-5 mt-6">
                    {loadingCategory ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-[#FA2D48] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            {categorySongs.map((song) => (
                                <div
                                    key={song.id}
                                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition cursor-pointer group"
                                    onClick={() => playSong(song)}
                                >
                                    <img src={song.coverUrl} className="w-12 h-12 rounded-[4px] object-cover shadow-sm bg-[#333]" />
                                    <div className="flex-1 min-w-0 border-b border-white/5 pb-2 ml-1 h-14 flex flex-col justify-center">
                                        <h4 className="text-white text-[16px] font-normal truncate group-hover:text-[#FA2D48] transition-colors">{song.title}</h4>
                                        <p className="text-gray-400 text-[14px] truncate">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="text-gray-500" />
                                    </button>
                                </div>
                            ))}
                         </div>
                    )}
                </div>
            </div>
         )
    }

    // Main View
    return (
        <div className="pb-32 bg-[#000000] min-h-screen overflow-hidden">
             {/* Header */}
            <div className="pt-4 md:pt-10 bg-[#000000] sticky top-0 z-20 pb-2 bg-opacity-90 backdrop-blur-xl border-b border-white/5">
                <div className="px-5 flex items-center justify-between">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
                        New
                    </h1>
                     <button
                        onClick={onSearchPress}
                        className="w-8 h-8 rounded-full bg-blue-500/0 flex items-center justify-center overflow-hidden border border-white/10"
                    >
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                    </button>
                </div>
            </div>

            <div className="pt-4">
                {loading ? (
                    <div className="animate-in fade-in duration-500 px-5">
                       <div className="w-full h-64 bg-white/5 rounded-xl animate-pulse mb-8" />
                       <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-4" />
                       <div className="flex gap-4 overflow-hidden">
                           {[1,2,3].map(i => <SkeletonCard key={i} />)}
                       </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                        
                        {/* Enhanced Hero Section with Gradient */}
                        <div className="relative px-5 mb-10 overflow-hidden">
                            {/* Animated Background Gradients */}
                            <div className="absolute inset-0 -mx-5">
                                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FA2D48]/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                            </div>

                            {/* Welcome Message */}
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-[#FA2D48] to-purple-500 rounded-full"></div>
                                    <p className="text-sm font-semibold text-gray-400 tracking-wide uppercase">
                                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                                    </p>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                                    What do you want to hear?
                                </h2>
                                <p className="text-gray-400 text-sm md:text-base">
                                    Your personalized music feed waiting for you
                                </p>
                            </div>

                            {/* Quick Play Cards - 2x2 Grid */}
                            <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4 mb-6">
                                {trending.slice(0, 4).map((song, index) => (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 rounded-xl p-3 md:p-4 cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm"
                                    >
                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#FA2D48]/0 to-purple-500/0 group-hover:from-[#FA2D48]/10 group-hover:to-purple-500/5 transition-all duration-500 rounded-xl"></div>
                                        
                                        <div className="relative flex items-center gap-3">
                                            {/* Album Art */}
                                            <div className="relative flex-none w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-lg">
                                                <img 
                                                    src={song.coverUrl} 
                                                    alt={song.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                />
                                                {/* Play Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                                        <Play size={14} fill="black" className="text-black ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Song Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold text-sm md:text-base truncate mb-0.5 group-hover:text-[#FA2D48] transition-colors">
                                                    {song.title}
                                                </h4>
                                                <p className="text-gray-400 text-xs md:text-sm truncate">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Index Badge */}
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white/60">#{index + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Featured New Releases - Enhanced Horizontal Scroll */}
                        <div className="mb-10">
                            <div className="px-5 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">New Releases</h2>
                                        <p className="text-sm text-gray-400">Fresh tracks just for you</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-500" />
                                </div>
                            </div>
                            <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                {trending.slice(0, 6).map((song) => (
                                    <div 
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className="snap-start flex-none w-[160px] md:w-[180px] group cursor-pointer"
                                    >
                                        {/* Album Art with Hover Effect */}
                                        <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-[#1a1a1a] shadow-xl border border-white/5 group-hover:border-white/10 transition-all duration-300">
                                            <img 
                                                src={song.coverUrl} 
                                                alt={song.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {/* Play Button */}
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                                                <div className="w-10 h-10 bg-[#FA2D48] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                                                    <Play size={16} fill="white" className="text-white ml-0.5" />
                                                </div>
                                            </div>

                                            {/* New Badge */}
                                            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FA2D48] to-purple-500 px-2 py-1 rounded-md">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">New</span>
                                            </div>
                                        </div>

                                        {/* Song Info */}
                                        <h4 className="text-white font-semibold text-sm truncate mb-1 group-hover:text-[#FA2D48] transition-colors">
                                            {song.title}
                                        </h4>
                                        <p className="text-gray-400 text-xs truncate">
                                            {song.artist}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* More to Explore List */}
                        <div className="px-5 mb-10">
                            <h2 className="text-[22px] font-bold text-white mb-2">More to Explore</h2>
                            <div className="border-t border-white/10">
                                {EXPLORE_LINKS.map((link) => (
                                    <div 
                                        key={link} 
                                        onClick={() => handleCategoryClick(link)}
                                        className="flex items-center justify-between py-4 border-b border-white/10 cursor-pointer active:bg-white/5 px-2 -mx-2 rounded-lg transition-colors"
                                    >
                                        <span className="text-[19px] text-[#FA2D48] font-normal">{link}</span>
                                        <ChevronRight size={18} className="text-gray-600" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Artists Feed - Enhanced Section */}
                        <div className="mb-10 border-t border-white/5 pt-6">
                            <TopArtistsFeed
                                artists={topArtists}
                                onArtistClick={async (artist) => {
                                    // Search for artist's music and play
                                    const songs = await searchYouTube(`${artist.name} ${artist.topSong || 'top songs'}`);
                                    if (songs.length > 0) {
                                        playSong(songs[0]);
                                    }
                                }}
                                onPlayClick={async (artist) => {
                                    // Play artist's top song
                                    const songs = await searchYouTube(`${artist.name} ${artist.topSong || 'music'}`);
                                    if (songs.length > 0) {
                                        playSong(songs[0]);
                                    }
                                }}
                            />
                        </div>

                        {/* Other Sections */}
                        <SongSection title="Updated Playlists" songs={recommended} />
                        <SongSection title="Hot Tracks" songs={trending} />
                        <SongSection title="'Tis the Season" songs={[...trending].reverse()} />
                    </div>
                )}
            </div>
        </div>
    );
};
