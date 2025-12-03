import React, { useEffect, useState } from 'react';
import { TrendingUp, Mic2, Guitar, Headphones, Wind, Coffee, Speaker, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchYouTube, getTrendingVideos } from '../services/youtubeService';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';

const GENRES = [
    { id: 'pop', name: 'Pop', query: 'pop music 2024', icon: Mic2, gradient: 'from-[#FF2E54] to-[#FF0055]' },
    { id: 'rock', name: 'Rock', query: 'rock music hits', icon: Guitar, gradient: 'from-[#A100F2] to-[#6200EA]' },
    { id: 'hiphop', name: 'Hip-Hop', query: 'hip hop rap music', icon: Speaker, gradient: 'from-[#FF9500] to-[#FF5E3A]' },
    { id: 'electronic', name: 'Electronic', query: 'electronic dance music', icon: Headphones, gradient: 'from-[#00F2EA] to-[#0066FF]' },
    { id: 'jazz', name: 'Jazz', query: 'jazz music instrumental', icon: Wind, gradient: 'from-[#FFD60A] to-[#FF9F0A]' },
    { id: 'chill', name: 'Chill', query: 'chill lofi beats', icon: Coffee, gradient: 'from-[#30D158] to-[#00C853]' },
];

const MOODS = [
    { name: 'Workout', emoji: '🔥', query: 'workout motivation music' },
    { name: 'Focus', emoji: '🧠', query: 'focus study music' },
    { name: 'Party', emoji: '🎉', query: 'party music hits' },
    { name: 'Relax', emoji: '🍃', query: 'relaxing calm music' },
    { name: 'Sleep', emoji: '🌙', query: 'sleep music peaceful' },
    { name: 'Morning', emoji: '🌅', query: 'morning wake up music' },
];

export const Explore: React.FC = () => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [selectedGenre, setSelectedGenre] = useState<string>('pop');
    const [genreSongs, setGenreSongs] = useState<Record<string, Song[]>>({});
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    // Load trending on mount
    useEffect(() => {
        loadTrending();
    }, []);

    // Load genre when selected
    useEffect(() => {
        if (selectedGenre && !genreSongs[selectedGenre]) {
            loadGenre(selectedGenre);
        }
    }, [selectedGenre]);

    const loadTrending = async () => {
        try {
            const songs = await getTrendingVideos();
            setTrendingSongs(songs);
        } catch (error) {
            console.error('Failed to load trending', error);
        }
    };

    const loadGenre = async (genreId: string) => {
        const genre = GENRES.find(g => g.id === genreId);
        if (!genre) return;

        setLoading(prev => ({ ...prev, [genreId]: true }));
        try {
            const songs = await searchYouTube(genre.query);
            setGenreSongs(prev => ({ ...prev, [genreId]: songs }));
        } catch (error) {
            console.error(`Failed to load ${genreId}`, error);
        } finally {
            setLoading(prev => ({ ...prev, [genreId]: false }));
        }
    };

    const loadMood = async (mood: typeof MOODS[0]) => {
        setLoading(prev => ({ ...prev, [mood.name]: true }));
        try {
            const songs = await searchYouTube(mood.query);
            setGenreSongs(prev => ({ ...prev, [mood.name]: songs }));
            setSelectedGenre(mood.name);
        } catch (error) {
            console.error(`Failed to load ${mood.name}`, error);
        } finally {
            setLoading(prev => ({ ...prev, [mood.name]: false }));
        }
    };

    const currentGenre = GENRES.find(g => g.id === selectedGenre);
    const currentSongs = genreSongs[selectedGenre] || [];

    return (
        <div className="pb-32 bg-[#121212] min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gradient-to-b from-[#121212] to-transparent pt-6 pb-4 px-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    Explore
                </h1>
                <p className="text-neutral-400 text-sm">
                    Discover new music by genre and mood
                </p>
            </div>

            {/* Trending Section */}
            <div className="mb-10 px-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-red-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                </div>
                <div className="flex overflow-x-auto space-x-5 pb-4 no-scrollbar snap-x">
                    {trendingSongs.slice(0, 10).map((song) => (
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

            {/* Mood Pills */}
            <div className="mb-10 px-6">
                <h2 className="text-xl font-bold text-white mb-4">Moods & Activities</h2>
                <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.name}
                            onClick={() => loadMood(mood)}
                            className="flex-none px-6 py-3 rounded-full bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-white font-medium">{mood.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Genre Tabs */}
            <div className="mb-6 px-6">
                <h2 className="text-xl font-bold text-white mb-4">Browse by Genre</h2>
                <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar">
                    {GENRES.map((genre) => {
                        const Icon = genre.icon;
                        const isActive = selectedGenre === genre.id;
                        return (
                            <button
                                key={genre.id}
                                onClick={() => setSelectedGenre(genre.id)}
                                className={`flex-none px-5 py-3 rounded-full transition-all ${isActive
                                    ? `bg-gradient-to-r ${genre.gradient} text-white shadow-lg scale-105`
                                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon size={18} />
                                    <span className="font-bold text-sm">{genre.name}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Genre Content */}
            <div className="px-6">
                {currentGenre && (
                    <div className="mb-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            {React.createElement(currentGenre.icon, {
                                size: 32,
                                className: `text-transparent bg-gradient-to-r ${currentGenre.gradient} bg-clip-text`
                            })}
                            <h3 className="text-2xl font-bold text-white">{currentGenre.name}</h3>
                        </div>
                        <p className="text-neutral-400 text-sm">
                            Discover the best {currentGenre.name.toLowerCase()} tracks
                        </p>
                    </div>
                )}

                {loading[selectedGenre] ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-neutral-400">Loading {currentGenre?.name}...</p>
                    </div>
                ) : currentSongs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {currentSongs.map((song) => (
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
                    <div className="flex flex-col items-center justify-center py-20">
                        <Music size={64} className="text-neutral-700 mb-4" />
                        <p className="text-neutral-500">No songs found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
