import React, { useEffect, useState } from 'react';
import { Play, Mic2, Guitar, Headphones, Wind, Coffee, Speaker, Radio as RadioIcon, Signal, TrendingUp } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchYouTube, getTrendingVideos } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';

const STATIONS = [
    { id: 'pop', name: 'Pop Hits Radio', query: 'pop music radio 2024', icon: Mic2, color: 'from-pink-500 to-rose-500', image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80' },
    { id: 'hiphop', name: 'Hip-Hop Station', query: 'hip hop radio live', icon: Speaker, color: 'from-orange-500 to-red-500', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
    { id: 'rock', name: 'Rock Classics', query: 'classic rock radio', icon: Guitar, color: 'from-purple-500 to-indigo-500', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80' },
    { id: 'electronic', name: 'EDM & Dance', query: 'edm radio live', icon: Headphones, color: 'from-cyan-500 to-blue-500', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { id: 'lofi', name: 'Lofi 24/7', query: 'lofi hip hop radio', icon: Coffee, color: 'from-green-500 to-emerald-500', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80' },
    { id: 'jazz', name: 'Smooth Jazz', query: 'smooth jazz radio', icon: Wind, color: 'from-amber-400 to-orange-500', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
];

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
        const randomStation = STATIONS[Math.floor(Math.random() * STATIONS.length)];
        playStation(randomStation);
    };

    const playStation = async (station: typeof STATIONS[0]) => {
        setActiveStation(station.id);
        setLoading(true);
        try {
            // Fetch songs for the station
            const songs = await searchYouTube(station.query);
            
            if (songs.length > 0) {
                // SHUFFLE for true radio feel
                // Filter out songs that might be "Stream Offline" or similar if possible (hard to detect by title alone)
                const shuffled = [...songs].sort(() => 0.5 - Math.random());
                
                setStationSongs(shuffled);
                
                // Play first song, queue the rest
                playSong(shuffled[0], shuffled.slice(1));
            } else {
                console.warn("No songs found for station:", station.name);
                // Fallback attempt?
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
                {/* Hero / Now Playing Station */}
                <div className="mb-10 relative overflow-hidden rounded-2xl bg-[#1C1C1E] border border-white/5 shadow-2xl group">
                     <div className="absolute inset-0 bg-gradient-to-r from-[#FA2D48]/20 to-transparent opacity-50" />
                     <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#FA2D48] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                     
                     <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[#FA2D48] font-bold text-sm tracking-wider uppercase mb-2">
                                <Signal size={16} className="animate-pulse" />
                                Live Station
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                Your Personal Mix
                            </h2>
                            <p className="text-gray-400 text-lg max-w-lg mb-6 leading-relaxed">
                                Endless music tailored to your taste. Discover new tracks and rediscover old favorites.
                            </p>
                            <button 
                                onClick={playRandomStation}
                                className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <Play fill="black" size={20} />
                                Start Listening
                            </button>
                        </div>
                        {/* Visual Decoration */}
                        <div className="hidden md:block w-48 h-48 relative">
                             <div className="absolute inset-0 bg-gradient-to-tr from-[#FA2D48] to-purple-600 rounded-full animate-spin-slow blur-xl opacity-60" />
                             <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center border border-white/10">
                                <RadioIcon size={64} className="text-white" />
                             </div>
                        </div>
                     </div>
                </div>

                {/* Stations Grid */}
                <h3 className="text-2xl font-bold text-white mb-6">Featured Stations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {STATIONS.map((station) => (
                        <div 
                            key={station.id}
                            onClick={() => playStation(station)}
                            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
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
                            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                <span className="bg-white/10 backdrop-blur-md self-start px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-auto border border-white/10">
                                    Live
                                </span>
                                
                                <div>
                                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h4 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1 drop-shadow-md">
                                            {station.name}
                                        </h4>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-6 h-6 rounded-full bg-[#FA2D48] flex items-center justify-center">
                                                <Play fill="white" size={10} className="text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white/90">Tune In</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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
                        <h3 className="text-2xl font-bold text-white mb-6">Now Playing on {STATIONS.find(s => s.id === activeStation)?.name}</h3>
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
