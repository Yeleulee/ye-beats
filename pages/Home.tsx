
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
                        
                        {/* Coming Soon / Hero Section */}
                        <div className="px-5 mb-10">
                            <div className="flex items-center justify-between mb-3 text-white">
                                <h2 className="text-[22px] font-bold">Coming Soon</h2>
                                <ChevronRight size={20} className="text-neutral-500" />
                            </div>
                            {/* We use the trending data for the hero, but style it as specific cards */}
                            <div className="flex overflow-x-auto gap-4 no-scrollbar snap-x scroll-pl-5 pb-4">
                                {trending.slice(0, 4).map((song) => (
                                    <div 
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className="snap-start flex-none w-[85vw] md:w-[45vw] lg:w-[30vw] flex flex-col cursor-pointer group"
                                    >
                                        <div className="relative aspect-[16/10] mb-2 overflow-hidden rounded-xl bg-[#222] shadow-lg border border-white/5">
                                            <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white">
                                                New Release
                                            </div>
                                        </div>
                                        <span className="text-white font-medium text-[15px] truncate">{song.title}</span>
                                        <span className="text-gray-400 text-[14px] truncate">{song.artist}</span>
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
