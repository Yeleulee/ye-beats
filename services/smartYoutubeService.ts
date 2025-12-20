import { Song } from '../types';
import { fetchYouTubeWithRotation } from './apiKeyManager';
import { MOCK_SONGS } from '../constants'; // Fallback if completely failed

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse ISO 8601 duration
const parseDuration = (duration: string): string => {
    if (!duration) return "0:00";
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';
    if (hours) {
        result += `${hours}:`;
        result += `${minutes.padStart(2, '0') || '00'}:`;
    } else {
        result += `${minutes || '0'}:`;
    }
    result += seconds.padStart(2, '0') || '00';

    return result;
};

const mapYouTubeItemToSong = (item: any): Song => {
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;
    const thumbnail = snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url;

    return {
        id: item.id,
        youtubeId: typeof item.id === 'string' ? item.id : item.id.videoId,
        title: snippet.title,
        artist: snippet.channelTitle,
        album: "YouTube Music",
        coverUrl: thumbnail,
        duration: contentDetails ? parseDuration(contentDetails.duration) : "3:00"
    };
};

// Strict validation for embeddable videos
const isVideoEmbeddable = (item: any): boolean => {
    const status = item.status;
    const contentDetails = item.contentDetails;
    const snippet = item.snippet;

    // Must be embeddable
    if (status?.embeddable !== true) return false;

    // Must be public
    if (status?.publicStatsViewable === false) return false;
    if (status?.privacyStatus !== 'public') return false;

    // No age restrictions (mild check)
    if (contentDetails?.contentRating?.ytRating) return false;

    // Not a livestream
    if (snippet?.liveBroadcastContent !== 'none') return false;

    // Check if there's regionRestriction that might affect embedding
    if (contentDetails?.regionRestriction?.blocked?.length > 0) return false;

    return true;
};

// Simple Caching Helper (24h TTL)
const fetchWithCache = async <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
    const CACHE_PREFIX = 'smart_cache_';
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    
    if (cached) {
        try {
            const entry = JSON.parse(cached);
            if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
                 console.log(`📦 Serving "${key}" from cache`);
                 return entry.data;
            }
        } catch (e) {}
    }

    const data = await fetchFn();
    
    if (Array.isArray(data) && data.length > 0) {
        try {
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (e) {
            // Storage full? Ignore.
        }
    }
    return data;
};

/**
 * Smart search that tries multiple query variations to find embeddable videos
 */
export const smartSearchYouTube = async (songTitle: string, artist: string): Promise<Song[]> => {
    const cacheKey = `search_${encodeURIComponent(`${songTitle}_${artist}`)}`;
    
    return fetchWithCache(cacheKey, async () => {
        // Single most effective variation to minimize quota
        const searchVariations = [
            `${songTitle} ${artist} lyrics`,           // Best for finding official/lyric vids
        ];

        let allValidSongs: Song[] = [];

        for (const query of searchVariations) {
            try {
                // Optimization: Minimal results to save quota (3 instead of 5)
                const searchRes = await fetchYouTubeWithRotation(key => 
                    `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=3&videoEmbeddable=true&key=${key}`
                );

                if (!searchRes.ok) continue;

                const searchData = await searchRes.json();
                if (!searchData.items || searchData.items.length === 0) continue;

                const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

                // Fetch full details with status check (Cost: 1 unit)
                const detailsRes = await fetchYouTubeWithRotation(key => 
                    `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${key}`
                );
                
                if (!detailsRes.ok) continue;

                const detailsData = await detailsRes.json();
                const validItems = detailsData.items.filter(isVideoEmbeddable);

                allValidSongs = [...allValidSongs, ...validItems.map(mapYouTubeItemToSong)];

                // If we found at least 2 good results, STOP searching. 
                // We don't need to burn 100 more units for the next variation.
                if (allValidSongs.length >= 2) break; 

            } catch (error) {
                console.error(`Search failed for "${query}":`, error instanceof Error ? error.message : "Unknown error");
                continue;
            }
        }

        // De-dupe
        const uniqueSongs = allValidSongs.filter((song, index, self) =>
            index === self.findIndex((s) => s.youtubeId === song.youtubeId)
        );

        return uniqueSongs.slice(0, 5);
    });
};

/**
 * Get trending embeddable videos
 */
export const getEmbeddableTrending = async (): Promise<Song[]> => {
    return fetchWithCache('trending_smart_v4', async () => {
        try {
            const res = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/videos?part=snippet,contentDetails,status&chart=mostPopular&videoCategoryId=10&maxResults=40&regionCode=US&key=${key}`
            );
            if (!res.ok) throw new Error("YouTube Trending Failed");

            const data = await res.json();
            const embeddableItems = data.items.filter(isVideoEmbeddable);

            return embeddableItems.slice(0, 20).map(mapYouTubeItemToSong);
        } catch (error) {
            console.error("YouTube Trending Error:", error instanceof Error ? error.message : "Unknown error");
            return [];
        }
    });
};

/**
 * Search with fallback
 */
export const searchWithFallback = async (query: string): Promise<Song[]> => {
    // 1. Try smart search (now cached)
    const smartResults = await smartSearchYouTube(query, '');

    if (smartResults.length > 0) {
        return smartResults;
    }

    // 2. Fallback to trending (cached)
    console.warn('Smart search returned no results, falling back to trending');
    return getEmbeddableTrending();
};
