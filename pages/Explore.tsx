import React, { useEffect, useState } from 'react';
import { Play, Mic2, Guitar, Headphones, Wind, Coffee, Speaker, Radio as RadioIcon, Signal, TrendingUp, Heart, Zap, Sparkles, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchYouTube, getTrendingVideos } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';

const POPULAR_STATIONS = [
    { id: 'top-hits', name: 'Top Hits Radio', query: 'top hits 2024 2025 music', icon: TrendingUp, color: 'from-red-500 via-pink-500 to-purple-600', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { id: 'your-mix', name: 'Your Daily Mix', query: 'trending music 2025 popular', icon: Sparkles, color: 'from-blue-500 via-indigo-500 to-purple-600', image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80' },
];

const GENRE_STATIONS = [
    { id: 'pop', name: 'Pop Hits', query: 'pop music 2024', icon: Mic2, color: 'from-pink-500 to-rose-500', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80' },
    { id: 'hiphop', name: 'Hip-Hop', query: 'hip hop rap music', icon: Speaker, color: 'from-orange-500 to-red-600', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
    { id: 'rock', name: 'Rock', query: 'rock music hits', icon: Guitar, color: 'from-purple-600 to-indigo-600', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80' },
    { id: 'electronic', name: 'Electronic', query: 'electronic dance music edm', icon: Headphones, color: 'from-cyan-500 to-blue-600', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80' },
    { id: 'rb', name: 'R&B', query: 'rnb music soul', icon: Heart, color: 'from-rose-400 to-red-500', image: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80' },
    { id: 'indie', name: 'Indie', query: 'indie alternative music', icon: Music2, color: 'from-teal-500 to-green-500', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80' },
];

const MOOD_STATIONS = [
    { id: 'lofi', name: 'Lofi Beats', query: 'lofi hip hop chill', icon: Coffee, color: 'from-green-400 to-emerald-500', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80' },
    { id: 'jazz', name: 'Jazz Vibes', query: 'smooth jazz relax', icon: Wind, color: 'from-amber-400 to-orange-500', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
    { id: 'workout', name: 'Workout', query: 'workout gym motivation music', icon: Zap, color: 'from-yellow-400 to-orange-500', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
    { id: 'chill', name: 'Chill Out', query: 'chill relaxing music', icon: Coffee, color: 'from-sky-400 to-blue-500', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80' },
];

const ALL_STATIONS = [...POPULAR_STATIONS, ...GENRE_STATIONS, ...MOOD_STATIONS];

export const Explore: React.FC = () => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [activeStation, setActiveStation] = useState<string | null>(null);
    const [stationSongs, setStationSongs] = useState<Song[]>([]);
    const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingRecommended, setLoadingRecommended] = useState(true);

    // Load recommended songs on mount
    useEffect(() => {
        const loadRecommendedSongs = async () => {
            try {
                console.log('📻 Loading recommended songs for Radio...');
                const trending = await getTrendingVideos();
                setRecommendedSongs(trending.slice(0, 12)); // Show 12 recommended songs
            } catch (error) {
                console.error('Failed to load recommended songs:', error);
            } finally {
                setLoadingRecommended(false);
            }
        };
        
        loadRecommendedSongs();
    }, []);

    const playRandomStation = () => {
        const randomStation = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
        playStation(randomStation);
    };

    const playStation = async (station: typeof ALL_STATIONS[0]) => {
        setActiveStation(station.id);
        setLoading(true);
        try {
            // Fetch songs for the station
            const songs = await searchYouTube(station.query);
            
            if (songs.length > 0) {
                // SHUFFLE for true radio feel
                const shuffled = [...songs].sort(() => 0.5 - Math.random());
                
                setStationSongs(shuffled);
                
                // Play first song, queue the rest
                playSong(shuffled[0], shuffled.slice(1));
            } else {
                console.warn("No songs found for station:", station.name);
            }
        } catch (e) {
            console.error("Radio Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 bg-[#000000] min-h-screen">
            {/* Header */}
            <div className="pt-4 md:pt-10 sticky top-0 z-20 pb-4 bg-[#000000]/95 backdrop-blur-xl border-b border-white/5 px-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <RadioIcon className="text-[#FA2D48]" size={32} />
                        Radio
                    </h1>
                </div>
            </div>

            <div className="p-5 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Enhanced Featured Hero Section */}
                <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] border border-white/10 shadow-2xl">
                     {/* Animated Background Layers */}
                     <div className="absolute inset-0 bg-gradient-to-r from-[#FA2D48]/20 via-purple-500/20 to-blue-500/20 opacity-50 animate-gradient-x" />
                     <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#FA2D48] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse" />
                     <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-15 pointer-events-none" />
                     
                     <div className="p-6 md:p-10 relative z-10">
                        {/* Top Section - Title & Description */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-[#FA2D48] font-bold text-xs tracking-widest uppercase mb-3">
                                <Signal size={14} className="animate-pulse" />
                                <span className="bg-[#FA2D48]/20 px-2 py-0.5 rounded-full border border-[#FA2D48]/30">Live Now</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
                                Featured Stations
                            </h2>
                            <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
                                Discover handpicked radio stations playing non-stop music. From chart-toppers to genre-specific beats.
                            </p>
                        </div>

                        {/* Featured Stations Carousel */}
                        <div className="mb-6">
                            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x scroll-pl-5 -mx-2 px-2">
                                {POPULAR_STATIONS.concat(GENRE_STATIONS.slice(0, 3)).map((station) => {
                                    const Icon = station.icon;
                                    return (
                                        <div
                                            key={station.id}
                                            onClick={() => playStation(station)}
                                            className="group flex-none w-64 md:w-72 snap-start cursor-pointer"
                                        >
                                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black">
                                                {/* Station Image */}
                                                <img
                                                    src={station.image}
                                                    alt={station.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {/* Dark Overlay */}
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                                                {/* Gradient Overlay */}
                                                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-40 mix-blend-overlay`} />
                                                
                                                {/* Loading State */}
                                                {loading && activeStation === station.id && (
                                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-20">
                                                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                                    {/* Live Badge */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="bg-[#FA2D48] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                            Live
                                                        </span>
                                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                            <Icon size={20} className="text-white" />
                                                        </div>
                                                    </div>

                                                    {/* Station Info */}
                                                    <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                                        <h4 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                                                            {station.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                                                                <Play fill="black" size={14} className="text-black ml-0.5" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-white/90">Tune In</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={playRandomStation}
                                className="flex-1 bg-white text-black px-6 py-4 rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                <Play fill="black" size={20} />
                                <span>Play Random Station</span>
                            </button>
                            <button
                                onClick={() => playStation(POPULAR_STATIONS[0])}
                                className="flex-1 bg-[#FA2D48] text-white px-6 py-4 rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(250,45,72,0.3)]"
                            >
                                <TrendingUp size={20} />
                                <span>Top Hits Now</span>
                            </button>
                        </div>
                     </div>
                </div>

                {/* Popular Stations - Large Cards */}
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Popular Now</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {POPULAR_STATIONS.map((station) => (
                            <div 
                                key={station.id}
                                onClick={() => playStation(station)}
                                className="group relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                <img 
                                    src={station.image} 
                                    alt={station.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-30 group-hover:opacity-40 mix-blend-overlay transition-opacity`} />
                                
                                {/* Loading State Overlay */}
                                {loading && activeStation === station.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <span className="bg-white/10 backdrop-blur-md self-start px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-auto border border-white/10">
                                        Live
                                    </span>
                                    
                                    <div>
                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h4 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2 drop-shadow-md">
                                                {station.name}
                                            </h4>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-8 h-8 rounded-full bg-[#FA2D48] flex items-center justify-center">
                                                    <Play fill="white" size={12} className="text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-white/90">Tune In Now</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Genre Stations */}
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Genres</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {GENRE_STATIONS.map((station) => (
                            <div 
                                key={station.id}
                                onClick={() => playStation(station)}
                                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                <img 
                                    src={station.image} 
                                    alt={station.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-30 group-hover:opacity-40 mix-blend-overlay transition-opacity`} />
                                
                                {loading && activeStation === station.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                    <span className="bg-white/10 backdrop-blur-sm self-start px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                                        Live
                                    </span>
                                    <h4 className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-md">
                                        {station.name}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mood Stations */}
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Moods & Activities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MOOD_STATIONS.map((station) => (
                            <div 
                                key={station.id}
                                onClick={() => playStation(station)}
                                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                <img 
                                    src={station.image} 
                                    alt={station.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-30 group-hover:opacity-40 mix-blend-overlay transition-opacity`} />
                                
                                {loading && activeStation === station.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                    <span className="bg-white/10 backdrop-blur-sm self-start px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                                        Live
                                    </span>
                                    <h4 className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-md">
                                        {station.name}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended for You Section */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-[#FA2D48]" size={28} />
                        <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
                    </div>
                    
                    {loadingRecommended ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-white/5 rounded-lg mb-3" />
                                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : recommendedSongs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {recommendedSongs.map((song) => (
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
                        <div className="text-center py-12 text-gray-400">
                            <p>No recommendations available at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Recent Tracks Section (if active) */}
                {activeStation && stationSongs.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-white mb-6">Now Playing on {ALL_STATIONS.find(s => s.id === activeStation)?.name}</h3>
                        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                           {stationSongs.map((song) => (
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
                )}
            </div>
        </div>
    );
};
