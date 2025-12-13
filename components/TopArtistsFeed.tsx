import React from 'react';
import { Play, TrendingUp, Heart, Share2, Sparkles, Crown, Flame } from 'lucide-react';

export interface ArtistRanking {
    id: string;
    name: string;
    imageUrl: string;
    genres: string[];
    
    // Engagement metrics
    playCount: number;
    likeCount: number;
    shareCount: number;
    
    // Ranking data
    globalRank?: number;
    personalRank?: number;
    trend: 'rising' | 'stable' | 'falling';
    trendPercentage: number;
    
    // Personalization
    userListens?: number;
    isUserFavorite?: boolean;
    tagline: string;
    
    // Content
    topSong?: string;
    color?: string; // Brand color for gradient
}

interface TopArtistsFeedProps {
    artists: ArtistRanking[];
    onArtistClick: (artist: ArtistRanking) => void;
    onPlayClick: (artist: ArtistRanking) => void;
}

export const TopArtistsFeed: React.FC<TopArtistsFeedProps> = ({ 
    artists, 
    onArtistClick, 
    onPlayClick 
}) => {
    
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'rising') return <TrendingUp size={14} className="text-green-400" />;
        if (trend === 'falling') return <TrendingUp size={14} className="text-red-400 rotate-180" />;
        return null;
    };

    const getRankBadge = (index: number) => {
        if (index === 0) return <Crown size={16} className="text-yellow-400" />;
        if (index === 1) return <Crown size={14} className="text-gray-300" />;
        if (index === 2) return <Crown size={14} className="text-orange-400" />;
        return null;
    };

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="px-5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={20} className="text-[#FA2D48]" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Top Artists
                    </h2>
                </div>
                <p className="text-sm text-gray-400">
                    Based on your listening and global trends
                </p>
            </div>

            {/* Artists Grid */}
            <div className="px-5">
                <div className="space-y-3">
                    {artists.map((artist, index) => (
                        <div
                            key={artist.id}
                            className="group relative"
                            onClick={() => onArtistClick(artist)}
                        >
                            {/* Artist Card */}
                            <div className="relative bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0A] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden">
                                
                                {/* Animated Background Gradient */}
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, ${artist.color || '#FA2D48'}15 0%, transparent 60%)`
                                    }}
                                />

                                {/* Content Container */}
                                <div className="relative z-10 flex items-center gap-4">
                                    
                                    {/* Rank Number */}
                                    <div className="flex-none flex items-center justify-center w-10">
                                        {index < 3 ? (
                                            getRankBadge(index)
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-600">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Artist Image with Animation */}
                                    <div className="relative flex-none">
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                                            <img
                                                src={artist.imageUrl}
                                                alt={artist.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Overlay gradient on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                        </div>
                                        
                                        {/* Favorite Badge */}
                                        {artist.isUserFavorite && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FA2D48] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <Heart size={12} fill="white" className="text-white" />
                                            </div>
                                        )}

                                        {/* Play Button Overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPlayClick(artist);
                                            }}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            aria-label={`Play ${artist.name}`}
                                        >
                                            <div className="w-10 h-10 bg-[#FA2D48] rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-transform">
                                                <Play size={18} fill="white" className="text-white ml-0.5" />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Artist Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Name and Tagline */}
                                        <div className="mb-2">
                                            <h3 className="text-lg md:text-xl font-bold text-white truncate mb-0.5 group-hover:text-[#FA2D48] transition-colors">
                                                {artist.name}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Tagline */}
                                                <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-[#FA2D48] to-purple-500 bg-clip-text text-transparent">
                                                    {artist.tagline}
                                                </span>
                                                
                                                {/* Trend Indicator */}
                                                {artist.trend !== 'stable' && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full">
                                                        {getTrendIcon(artist.trend)}
                                                        <span className={`text-xs font-bold ${
                                                            artist.trend === 'rising' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {artist.trendPercentage}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Genres */}
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {artist.genres.slice(0, 2).map((genre) => (
                                                <span 
                                                    key={genre}
                                                    className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-400 border border-white/5"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Engagement Metrics */}
                                        <div className="flex items-center gap-4 text-xs md:text-sm">
                                            {/* Play Count */}
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Play size={14} className="text-gray-500" fill="currentColor" />
                                                <span className="font-medium">{formatNumber(artist.playCount)}</span>
                                            </div>

                                            {/* Like Count */}
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Heart size={14} className="text-gray-500" />
                                                <span className="font-medium">{formatNumber(artist.likeCount)}</span>
                                            </div>

                                            {/* Share Count */}
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Share2 size={14} className="text-gray-500" />
                                                <span className="font-medium">{formatNumber(artist.shareCount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        className="flex-none opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onArtistClick(artist);
                                        }}
                                        aria-label="View artist"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                            <span className="text-white text-xs">→</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Top Song Preview (if available) */}
                                {artist.topSong && (
                                    <div className="relative z-10 mt-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Flame size={14} className="text-[#FA2D48]" />
                                            <span className="text-xs text-gray-400">
                                                Top hit: <span className="text-white font-medium">{artist.topSong}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper function to generate intelligent rankings
export const generateArtistRankings = (
    artists: Array<{
        id: string;
        name: string;
        imageUrl: string;
        genres: string[];
        globalPlayCount: number;
        userListens?: number;
        topSong?: string;
        color?: string;
    }>,
    userPreferences?: {
        favoriteGenres?: string[];
        recentListens?: string[];
    }
): ArtistRanking[] => {
    
    const taglines = [
        "Your #1 this week",
        "Trending worldwide",
        "On the rise",
        "Your recent favorite",
        "Breaking the charts",
        "Hall of fame",
        "Climbing fast",
        "Your go-to artist",
        "Global sensation",
        "Fan favorite"
    ];

    return artists.map((artist, index) => {
        // Intelligent scoring: blend global trends with personal favorites
        const globalScore = artist.globalPlayCount || 0;
        const personalScore = (artist.userListens || 0) * 10; // Weight personal listens higher
        const genreBonus = userPreferences?.favoriteGenres?.some(g => artist.genres.includes(g)) ? 5000 : 0;
        const totalScore = globalScore + personalScore + genreBonus;

        // Generate engagement metrics
        const playCount = Math.floor(artist.globalPlayCount || Math.random() * 10000000);
        const likeCount = Math.floor(playCount * (0.1 + Math.random() * 0.2));
        const shareCount = Math.floor(playCount * (0.02 + Math.random() * 0.05));

        // Determine trend
        const trendValue = Math.random();
        const trend: 'rising' | 'stable' | 'falling' = 
            trendValue > 0.6 ? 'rising' : 
            trendValue > 0.3 ? 'stable' : 
            'falling';
        
        const trendPercentage = Math.floor(5 + Math.random() * 95);

        // Select tagline
        const isUserFavorite = (artist.userListens || 0) > 10;
        const tagline = isUserFavorite && index < 3
            ? taglines[index]
            : index < 2
            ? "Trending worldwide"
            : taglines[Math.floor(Math.random() * taglines.length)];

        return {
            ...artist,
            playCount,
            likeCount,
            shareCount,
            globalRank: index + 1,
            personalRank: artist.userListens ? index + 1 : undefined,
            trend,
            trendPercentage,
            isUserFavorite,
            tagline
        };
    }).sort((a, b) => {
        // Sort by combined score
        const scoreA = a.playCount + (a.userListens || 0) * 1000;
        const scoreB = b.playCount + (b.userListens || 0) * 1000;
        return scoreB - scoreA;
    });
};
