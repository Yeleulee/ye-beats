
import React, { useEffect, useState, useCallback } from 'react';
import { ChevronRight, Play, ArrowLeft, TrendingUp, Loader2, X, RefreshCw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube, getBillboardTopSongs } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';
import { TopArtistsFeed, ArtistRanking, generateArtistRankings } from '../components/TopArtistsFeed';

interface Props {
    onSearchPress: () => void;
}

// Categories for "More to Explore" - Enhanced with search queries
const EXPLORE_CATEGORIES = [
    { label: 'Music Videos', query: 'official music video 2024', icon: '🎬' },
    { label: 'Charts', query: 'billboard hot 100 songs 2024', icon: '📊' },
    { label: 'Hip-Hop', query: 'hip hop music 2024', icon: '🎤' },
    { label: 'Pop Hits', query: 'pop music hits 2024', icon: '🎵' },
    { label: 'R&B Soul', query: 'r&b soul music 2024', icon: '💜' },
    { label: 'Afrobeats', query: 'afrobeats music 2024', icon: '🌍' }
];

// Mood filters that actually work
const MOOD_FILTERS = [
    { id: 'energize', label: 'Energize', emoji: '⚡', query: 'energetic upbeat music' },
    { id: 'relax', label: 'Relax', emoji: '😌', query: 'chill relaxing music' },
    { id: 'workout', label: 'Workout', emoji: '💪', query: 'workout gym music' },
    { id: 'focus', label: 'Focus', emoji: '🎯', query: 'focus concentration music' },
    { id: 'party', label: 'Party', emoji: '🎉', query: 'party dance music' },
    { id: 'sleep', label: 'Sleep', emoji: '😴', query: 'sleep ambient music' },
    { id: 'romance', label: 'Romance', emoji: '💕', query: 'romantic love songs' },
    { id: 'mood', label: 'Mood Booster', emoji: '✨', query: 'feel good happy music' }
];

export const Home: React.FC<Props> = ({ onSearchPress }) => {
    const { playSong, setLyricsVisible, addToQueue, listeningHistory, getRecentArtists, getMostPlayedGenres } = usePlayer();
    
    // Main data states
    const [trending, setTrending] = useState<Song[]>([]);
    const [personalizedSongs, setPersonalizedSongs] = useState<Song[]>([]);
    const [heavyRotation, setHeavyRotation] = useState<Song[]>([]);
    const [femaleArtistSongs, setFemaleArtistSongs] = useState<Song[]>([]);
    const [maleArtistSongs, setMaleArtistSongs] = useState<Song[]>([]);
    const [topArtists, setTopArtists] = useState<ArtistRanking[]>([]);
    const [moodSongs, setMoodSongs] = useState<Song[]>([]);
    
    // Loading states per section
    const [loading, setLoading] = useState(true);
    const [loadingHeavyRotation, setLoadingHeavyRotation] = useState(true);
    const [loadingFemaleArtists, setLoadingFemaleArtists] = useState(true);
    const [loadingMaleArtists, setLoadingMaleArtists] = useState(true);
    const [loadingMood, setLoadingMood] = useState(false);
    
    // Sub-view state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoryQuery, setCategoryQuery] = useState<string>('');
    const [categorySongs, setCategorySongs] = useState<Song[]>([]);
    const [loadingCategory, setLoadingCategory] = useState(false);
    
    // Modal state for "See All"
    const [seeAllModal, setSeeAllModal] = useState<{ title: string; songs: Song[] } | null>(null);
    
    // Active mood filter
    const [activeMood, setActiveMood] = useState<string | null>(null);

    // Error states
    const [error, setError] = useState<string | null>(null);

    // Fetch main data on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get personalized recommendations based on listening history
                const recentArtists = getRecentArtists();
                const mostPlayedGenres = getMostPlayedGenres();
                
                let personalizedData: Song[] = [];
                
                if (recentArtists.length > 0) {
                    console.log('🎵 Fetching personalized recommendations based on:', recentArtists);
                    const artistQuery = recentArtists.slice(0, 3).join(' ');
                    personalizedData = await searchYouTube(`${artistQuery} latest songs`);
                } else {
                    console.log('🎵 New user - showing curated recommendations');
                    personalizedData = await searchYouTube("trending music 2024 2025");
                }
                
                setPersonalizedSongs(personalizedData);

                // Fetch trending
                const trendData = await getTrendingVideos();
                setTrending(trendData);

                // Generate Top Artists with real data
                const curatedArtists = generateTopArtistsFromTrending(trendData);
                setTopArtists(curatedArtists);
                
            } catch (e) {
                console.error("Failed to load home data", e);
                setError("Failed to load content. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch Heavy Rotation (real Billboard/top songs)
    useEffect(() => {
        const fetchHeavyRotation = async () => {
            setLoadingHeavyRotation(true);
            try {
                const songs = await getBillboardTopSongs();
                setHeavyRotation(songs);
            } catch (e) {
                console.error("Failed to load heavy rotation", e);
            } finally {
                setLoadingHeavyRotation(false);
            }
        };
        fetchHeavyRotation();
    }, []);

    // Fetch Female Artists songs
    useEffect(() => {
        const fetchFemaleArtists = async () => {
            setLoadingFemaleArtists(true);
            try {
                const songs = await searchYouTube("Taylor Swift Billie Eilish Dua Lipa SZA best songs 2024");
                setFemaleArtistSongs(songs);
            } catch (e) {
                console.error("Failed to load female artists", e);
            } finally {
                setLoadingFemaleArtists(false);
            }
        };
        fetchFemaleArtists();
    }, []);

    // Fetch Male Artists songs
    useEffect(() => {
        const fetchMaleArtists = async () => {
            setLoadingMaleArtists(true);
            try {
                const songs = await searchYouTube("The Weeknd Drake Ed Sheeran Bad Bunny best songs 2024");
                setMaleArtistSongs(songs);
            } catch (e) {
                console.error("Failed to load male artists", e);
            } finally {
                setLoadingMaleArtists(false);
            }
        };
        fetchMaleArtists();
    }, []);

    // Handle mood filter click - Now actually fetches content!
    const handleMoodClick = async (mood: typeof MOOD_FILTERS[0]) => {
        if (activeMood === mood.id) {
            setActiveMood(null);
            setMoodSongs([]);
            return;
        }
        
        setActiveMood(mood.id);
        setLoadingMood(true);
        try {
            const songs = await searchYouTube(mood.query);
            setMoodSongs(songs);
        } catch (e) {
            console.error("Failed to load mood songs", e);
        } finally {
            setLoadingMood(false);
        }
    };

    // Handle category click with loading state
    const handleCategoryClick = async (category: typeof EXPLORE_CATEGORIES[0]) => {
        setSelectedCategory(category.label);
        setCategoryQuery(category.query);
        setLoadingCategory(true);
        setCategorySongs([]);
        try {
            const songs = await searchYouTube(category.query);
            setCategorySongs(songs);
        } catch (e) {
            console.error("Failed to load category", e);
        } finally {
            setLoadingCategory(false);
        }
    };

    // Handle "See All" button click
    const handleSeeAll = (title: string, songs: Song[]) => {
        setSeeAllModal({ title, songs });
    };

    // Generate top artists from trending data - now uses the proper helper function
    const generateTopArtistsFromTrending = (songs: Song[]): ArtistRanking[] => {
        const artistMap = new Map<string, { count: number; song: Song }>();
        
        songs.forEach(song => {
            const existing = artistMap.get(song.artist);
            if (existing) {
                existing.count++;
            } else {
                artistMap.set(song.artist, { count: 1, song });
            }
        });

        const colors = ['#E31C23', '#FFA500', '#B794F4', '#FF6B6B', '#4ADE80', '#F59E0B', '#EC4899', '#8B5CF6'];
        
        // Build artist data for the generateArtistRankings helper
        const artistData = Array.from(artistMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([artist, data], index) => ({
                id: String(index + 1),
                name: artist,
                imageUrl: data.song.coverUrl,
                genres: ['Trending'],
                globalPlayCount: Math.floor(Math.random() * 10000000) + 5000000,
                userListens: data.count * 10,
                topSong: data.song.title,
                color: colors[index % colors.length]
            }));
        
        // Use the existing helper function which adds all required fields
        return generateArtistRankings(artistData);
    };

    // Loading skeleton component
    const SkeletonCard = () => (
        <div className="flex-none w-44 sm:w-48 snap-start animate-pulse">
            <div className="aspect-square w-full mb-3 bg-white/5 rounded-xl"></div>
            <div className="h-4 w-32 bg-white/5 rounded mb-2"></div>
            <div className="h-3 w-20 bg-white/5 rounded"></div>
        </div>
    );

    const SkeletonSection = ({ count = 4 }: { count?: number }) => (
        <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar">
            {Array(count).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
    );

    // Section Header with "See All" functionality
    const SectionHeader = ({ 
        title, 
        subtitle,
        songs,
        showSeeAll = true 
    }: { 
        title: string; 
        subtitle?: string;
        songs?: Song[];
        showSeeAll?: boolean;
    }) => (
        <div className="px-5 mb-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-0.5">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
                {showSeeAll && songs && songs.length > 0 && (
                    <button 
                        onClick={() => handleSeeAll(title, songs)}
                        className="flex items-center gap-1 text-[#FA2D48] text-sm font-medium hover:text-[#ff4560] transition-colors"
                    >
                        See All
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );

    // Song Section component
    const SongSection = ({ 
        title, 
        subtitle,
        songs, 
        loading: sectionLoading = false 
    }: { 
        title: string; 
        subtitle?: string;
        songs: Song[];
        loading?: boolean;
    }) => (
        <div className="mb-10">
            <SectionHeader title={title} subtitle={subtitle} songs={songs} />
            {sectionLoading ? (
                <SkeletonSection />
            ) : songs.length > 0 ? (
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
            ) : (
                <div className="px-5 py-8 text-center text-gray-500">
                    <p>No songs available</p>
                </div>
            )}
        </div>
    );

    // "See All" Modal Component
    const SeeAllModal = () => {
        if (!seeAllModal) return null;
        
        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl overflow-y-auto">
                <div className="min-h-screen">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSeeAllModal(null)}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                                <h1 className="text-2xl font-bold text-white">{seeAllModal.title}</h1>
                            </div>
                            <p className="text-gray-400 text-sm">{seeAllModal.songs.length} songs</p>
                        </div>
                    </div>
                    
                    {/* Content Grid */}
                    <div className="px-5 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {seeAllModal.songs.map((song) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    variant="responsive"
                                    onClick={() => {
                                        playSong(song);
                                        setSeeAllModal(null);
                                    }}
                                    onPlay={(e) => {
                                        e.stopPropagation();
                                        playSong(song);
                                        setSeeAllModal(null);
                                    }}
                                    onViewLyrics={(e) => {
                                        e.stopPropagation();
                                        playSong(song);
                                        setLyricsVisible(true);
                                        setSeeAllModal(null);
                                    }}
                                    onAddToQueue={(e) => {
                                        e.stopPropagation();
                                        addToQueue(song);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Category Detail View
    if (selectedCategory) {
        return (
            <div className="pb-32 bg-[#000000] min-h-screen overflow-hidden">
                <div className="pt-4 md:pt-10 bg-[#000000] sticky top-0 z-20 pb-2 bg-opacity-90 backdrop-blur-xl border-b border-white/5">
                    <div className="px-5 flex items-center gap-2">
                        <button 
                            onClick={() => setSelectedCategory(null)} 
                            className="flex items-center text-[#FA2D48] text-[17px] -ml-2 pr-2 hover:opacity-80 transition-opacity"
                        >
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
                            <Loader2 className="w-8 h-8 text-[#FA2D48] animate-spin mb-4" />
                            <p className="text-gray-400 text-sm">Loading {selectedCategory}...</p>
                        </div>
                    ) : categorySongs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categorySongs.map((song) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    variant="responsive"
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
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-gray-400 mb-4">No songs found for {selectedCategory}</p>
                            <button 
                                onClick={() => handleCategoryClick({ label: selectedCategory, query: categoryQuery, icon: '' })}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main View
    return (
        <div className="pb-32 bg-[#000000] min-h-screen overflow-hidden">
            {/* See All Modal */}
            <SeeAllModal />

            {/* Header */}
            <div className="pt-4 md:pt-10 bg-[#000000] sticky top-0 z-20 pb-3 bg-opacity-95 backdrop-blur-xl border-b border-white/5">
                <div className="px-5 flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
                        Home
                    </h1>
                    <button
                        onClick={onSearchPress}
                        className="w-9 h-9 rounded-full bg-blue-500/0 flex items-center justify-center overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                    >
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                    </button>
                </div>

                {/* Functional Mood Filter Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
                    {MOOD_FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleMoodClick(filter)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
                                activeMood === filter.id
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-white hover:bg-white/15'
                            }`}
                        >
                            <span>{filter.emoji}</span>
                            {filter.label}
                            {loadingMood && activeMood === filter.id && (
                                <Loader2 size={14} className="animate-spin" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-5">
                {loading ? (
                    <div className="animate-in fade-in duration-500 px-5">
                        <div className="w-full h-64 bg-white/5 rounded-xl animate-pulse mb-8" />
                        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-4" />
                        <SkeletonSection />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FA2D48] rounded-full text-white hover:bg-[#ff4560] transition-colors"
                        >
                            <RefreshCw size={16} />
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">

                        {/* Mood-Filtered Songs Section - Only shows when mood is active */}
                        {activeMood && (
                            <div className="mb-10">
                                <SectionHeader 
                                    title={`${MOOD_FILTERS.find(m => m.id === activeMood)?.emoji} ${MOOD_FILTERS.find(m => m.id === activeMood)?.label} Vibes`}
                                    subtitle="Matching your current mood"
                                    songs={moodSongs}
                                />
                                {loadingMood ? (
                                    <SkeletonSection />
                                ) : (
                                    <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                        {moodSongs.map((song) => (
                                            <SongCard
                                                key={song.id}
                                                song={song}
                                                onClick={() => playSong(song)}
                                                onPlay={(e) => {
                                                    e.stopPropagation();
                                                    playSong(song);
                                                }}
                                                onAddToQueue={(e) => {
                                                    e.stopPropagation();
                                                    addToQueue(song);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Welcome Message + Quick Play */}
                        <div className="relative px-5 mb-8 overflow-hidden">
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
                                    Your personalized music feed is ready
                                </p>
                            </div>

                            {/* Quick Play Cards - Using real trending data */}
                            <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4 mb-6">
                                {trending.slice(0, 4).map((song, index) => (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 rounded-xl p-3 md:p-4 cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#FA2D48]/0 to-purple-500/0 group-hover:from-[#FA2D48]/10 group-hover:to-purple-500/5 transition-all duration-500 rounded-xl"></div>
                                        
                                        <div className="relative flex items-center gap-3">
                                            <div className="relative flex-none w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-lg">
                                                <img 
                                                    src={song.coverUrl} 
                                                    alt={song.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                                        <Play size={14} fill="black" className="text-black ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold text-sm md:text-base truncate mb-0.5 group-hover:text-[#FA2D48] transition-colors">
                                                    {song.title}
                                                </h4>
                                                <p className="text-gray-400 text-xs md:text-sm truncate">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white/60">#{index + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Heavy Rotation - Now using REAL API data */}
                        <div className="mb-10">
                            <SectionHeader 
                                title="Heavy Rotation" 
                                subtitle="What's hot on Billboard"
                                songs={heavyRotation}
                            />
                            {loadingHeavyRotation ? (
                                <SkeletonSection count={6} />
                            ) : (
                                <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                    {heavyRotation.slice(0, 12).map((song, index) => (
                                        <div
                                            key={song.id}
                                            onClick={() => playSong(song)}
                                            className="snap-start flex-none w-[160px] group cursor-pointer"
                                        >
                                            <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#FA2D48]/10 to-purple-500/10 border border-white/10 shadow-xl group-hover:border-white/20 transition-all duration-300 mb-3">
                                                <img
                                                    src={song.coverUrl}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80"></div>
                                                
                                                {/* Rank Badge */}
                                                <div className="absolute top-2 left-2 w-7 h-7 bg-gradient-to-br from-[#FA2D48] to-purple-600 rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
                                                    <span className="text-xs font-black text-white">#{index + 1}</span>
                                                </div>
                                                
                                                {/* Play Button */}
                                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                                                    <div className="w-12 h-12 bg-[#FA2D48] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                                                        <Play size={18} fill="white" className="text-white ml-0.5" />
                                                    </div>
                                                </div>

                                                {/* Song Info on Card */}
                                                <div className="absolute bottom-3 left-3 right-16">
                                                    <h4 className="text-white font-bold text-sm truncate mb-0.5">
                                                        {song.title}
                                                    </h4>
                                                    <p className="text-white/80 text-xs truncate">
                                                        {song.artist}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Based on Your History - Personalized */}
                        {personalizedSongs.length > 0 && (
                            <SongSection
                                title="Based on your history"
                                subtitle={listeningHistory.length > 0 
                                    ? `Personalized for you • ${listeningHistory.length} songs played`
                                    : 'Discover new music'
                                }
                                songs={personalizedSongs}
                            />
                        )}

                        {/* Girls Songs Collection - Now using REAL API data */}
                        <div className="mb-10">
                            <SectionHeader 
                                title="Top Female Artists" 
                                subtitle="Hits from leading female artists"
                                songs={femaleArtistSongs}
                            />
                            {loadingFemaleArtists ? (
                                <SkeletonSection count={5} />
                            ) : (
                                <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                    {femaleArtistSongs.map((song) => (
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
                            )}
                        </div>

                        {/* Male Artists - Now using REAL API data */}
                        <div className="mb-10">
                            <SectionHeader 
                                title="Top Male Artists" 
                                subtitle="Hits from leading male artists"
                                songs={maleArtistSongs}
                            />
                            {loadingMaleArtists ? (
                                <SkeletonSection count={5} />
                            ) : (
                                <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                    {maleArtistSongs.map((song) => (
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
                            )}
                        </div>

                        {/* Listen Again - Using listening history or trending */}
                        <div className="mb-10">
                            <SectionHeader 
                                title="Listen again" 
                                subtitle={listeningHistory.length > 0 ? "Songs you've been enjoying" : "Artists you might enjoy"}
                                songs={listeningHistory.length > 0 ? listeningHistory.map(e => e.song) : trending}
                            />
                            <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x scroll-pl-5">
                                {listeningHistory.length > 0 ? (
                                    listeningHistory.slice(0, 15).map((entry, index) => (
                                        <div
                                            key={entry.song.id + index}
                                            onClick={() => playSong(entry.song)}
                                            className="snap-start flex-none w-[140px] group cursor-pointer"
                                        >
                                            <div className="relative w-[140px] h-[140px] mb-3">
                                                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
                                                    <img
                                                        src={entry.song.coverUrl}
                                                        alt={entry.song.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                                                        <div className="w-14 h-14 bg-[#FA2D48] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                                                            <Play size={24} fill="white" className="text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                {entry.playCount > 1 && (
                                                    <div className="absolute -top-1 -right-1 bg-[#FA2D48] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-black">
                                                        {entry.playCount}x
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-white font-semibold text-[14px] truncate mb-1 group-hover:text-[#FA2D48] transition-colors">
                                                    {entry.song.title.length > 20 
                                                        ? entry.song.title.substring(0, 20) + '...' 
                                                        : entry.song.title
                                                    }
                                                </h4>
                                                <p className="text-gray-400 text-[12px] truncate">{entry.song.artist}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    trending.slice(0, 8).map((song) => (
                                        <div
                                            key={song.id}
                                            onClick={() => playSong(song)}
                                            className="snap-start flex-none w-[140px] group cursor-pointer"
                                        >
                                            <div className="relative w-[140px] h-[140px] mb-3">
                                                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
                                                    <img
                                                        src={song.coverUrl}
                                                        alt={song.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                                                        <div className="w-14 h-14 bg-[#FA2D48] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                                                            <Play size={24} fill="white" className="text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-white font-semibold text-[14px] truncate mb-1 group-hover:text-[#FA2D48] transition-colors">
                                                    {song.title.length > 20 ? song.title.substring(0, 20) + '...' : song.title}
                                                </h4>
                                                <p className="text-gray-400 text-[12px] truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* More to Explore - Enhanced with loading states */}
                        <div className="px-5 mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">More to Explore</h2>
                            <div className="border-t border-white/10">
                                {EXPLORE_CATEGORIES.map((category) => (
                                    <div 
                                        key={category.label} 
                                        onClick={() => handleCategoryClick(category)}
                                        className="flex items-center justify-between py-4 border-b border-white/10 cursor-pointer hover:bg-white/5 active:bg-white/10 px-3 -mx-3 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{category.icon}</span>
                                            <span className="text-[17px] text-white font-medium">{category.label}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-500" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Artists Feed - Using generated data from trending */}
                        {topArtists.length > 0 && (
                            <div className="mb-10 border-t border-white/5 pt-6">
                                <TopArtistsFeed
                                    artists={topArtists}
                                    onArtistClick={async (artist) => {
                                        const songs = await searchYouTube(`${artist.name} ${artist.topSong || 'top songs'}`);
                                        if (songs.length > 0) {
                                            playSong(songs[0]);
                                        }
                                    }}
                                    onPlayClick={async (artist) => {
                                        const songs = await searchYouTube(`${artist.name} ${artist.topSong || 'music'}`);
                                        if (songs.length > 0) {
                                            playSong(songs[0]);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Trending Songs - List View */}
                        <div className="mb-10 px-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Trending songs for you</h2>
                                    <p className="text-sm text-gray-400">What's hot right now</p>
                                </div>
                                <button 
                                    onClick={() => handleSeeAll("Trending Songs", trending)}
                                    className="text-sm font-medium text-[#FA2D48] hover:text-[#ff4560] transition-colors"
                                >
                                    See All
                                </button>
                            </div>
                            <div className="space-y-2">
                                {trending.slice(0, 5).map((song, index) => (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="relative flex-none w-14 h-14 rounded-lg overflow-hidden bg-[#1a1a1a] shadow-lg">
                                            <img 
                                                src={song.coverUrl} 
                                                alt={song.title} 
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                                                    <Play size={12} fill="black" className="text-black ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium text-[15px] truncate group-hover:text-[#FA2D48] transition-colors">
                                                {song.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                                                <span className="truncate">{song.artist}</span>
                                                {song.duration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{song.duration}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-[#FA2D48]/10 rounded-md">
                                                <TrendingUp size={12} className="text-[#FA2D48]" />
                                                <span className="text-[10px] font-bold text-[#FA2D48]">#{index + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
