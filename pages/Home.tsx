
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube } from '../services/youtubeService';
import { Song } from '../types';
import { HeroSection } from '../components/HeroSection';
import { SongCard } from '../components/SongCard';

interface Props {
    onSearchPress: () => void;
}

export const Home: React.FC<Props> = ({ onSearchPress }) => {
    const { playSong, setLyricsVisible, addToQueue } = usePlayer();
    const [recommended, setRecommended] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    // Apple Music style date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
            } catch (e) {
                console.error("Failed to load home data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const SkeletonCard = () => (
        <div className="flex-none w-44 sm:w-48 snap-start">
            <div className="aspect-square w-full mb-3 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="h-4 w-32 bg-white/5 rounded mb-2 animate-pulse"></div>
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
        </div>
    );

    const SkeletonSection = () => (
        <div className="mb-12">
            <div className="flex items-center justify-between px-6 mb-4">
                <div className="h-8 w-48 bg-white/5 rounded animate-pulse"></div>
            </div>
            <div className="flex overflow-x-auto space-x-6 px-6 pb-4 no-scrollbar">
                {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="flex items-center justify-between px-6 mb-5 group cursor-pointer">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center group-hover:text-red-500 transition-colors">
                {title}
                <ChevronRight size={24} className="text-neutral-500 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
        </div>
    );

    const SongSection = ({ title, songs }: { title: string, songs: Song[] }) => (
        <div className="mb-12">
            <SectionHeader title={title} />
            <div className="flex overflow-x-auto space-x-5 px-6 pb-8 no-scrollbar snap-x scroll-pl-6">
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

    return (
        <div className="pb-32 bg-[#121212] min-h-screen overflow-hidden">
            {/* Top Bar with Profile & Search */}
            <div className="md:hidden sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg text-white cursor-pointer hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                    <span className="relative z-10">V</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>
                <button
                    onClick={onSearchPress}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all group relative overflow-hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 group-hover:scale-110 transition-transform relative z-10"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
            </div>

            <div className="pt-6 md:pt-10">
                {/* Header Date */}
                <div className="px-6 mb-6">
                    <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2 animate-in fade-in duration-500">
                        {dateString}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight animate-in slide-in-from-bottom-4 duration-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Listen Now
                    </h1>
                </div>

                {loading ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="px-6 mb-8">
                            <div className="w-full aspect-[21/9] bg-gradient-to-br from-white/5 via-white/3 to-transparent rounded-2xl animate-pulse border border-white/5" />
                        </div>
                        <SkeletonSection />
                        <SkeletonSection />
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                        {/* Hero Section with Top Trending */}
                        <div className="px-6 mb-10">
                            <HeroSection
                                featuredSongs={trending.slice(0, 5)}
                                onPlay={playSong}
                            />
                        </div>

                        {/* Quick Access Pills */}
                        <div className="px-6 mb-10">
                            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                                <button className="flex-none px-5 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white font-medium text-sm hover:scale-105 transition-transform">
                                    🔥 Hot Right Now
                                </button>
                                <button className="flex-none px-5 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white font-medium text-sm hover:scale-105 transition-transform">
                                    🎵 New Releases
                                </button>
                                <button className="flex-none px-5 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white font-medium text-sm hover:scale-105 transition-transform">
                                    ⭐ Top Charts
                                </button>
                            </div>
                        </div>

                        <SongSection title="Top Picks for You" songs={recommended} />
                        <SongSection title="Trending Now" songs={trending} />
                        <SongSection title="New Releases" songs={[...trending].reverse()} />
                        <SongSection title="Chill Vibes" songs={[...recommended].reverse()} />
                    </div>
                )}
            </div>
        </div>
    );
};
