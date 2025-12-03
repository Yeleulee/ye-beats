import { Song } from '../types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

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

    // No age restrictions
    if (contentDetails?.contentRating?.ytRating) return false;

    // Not a livestream
    if (snippet?.liveBroadcastContent !== 'none') return false;

    // Check if there's regionRestriction that might affect embedding
    if (contentDetails?.regionRestriction?.blocked?.length > 0) return false;

    return true;
};

/**
 * Smart search that tries multiple query variations to find embeddable videos
 */
export const smartSearchYouTube = async (songTitle: string, artist: string): Promise<Song[]> => {
    // Strategy: Try multiple search variations in order of preference
    const searchVariations = [
        `${songTitle} ${artist} lyrics`,           // Lyric videos - MOST likely to be embeddable
        `${songTitle} ${artist} official audio`,   // Official audio - Also very embeddable
        `${songTitle} ${artist} audio`,            // Generic audio
        `${songTitle} ${artist} lyric video`,      // Explicit lyric video search
        `${songTitle} ${artist}`,                  // Fallback to basic search
    ];

    let allValidSongs: Song[] = [];

    for (const query of searchVariations) {
        if (allValidSongs.length >= 3) break; // Stop when we have enough options

        try {
            const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
            const searchRes = await fetch(searchUrl);

            if (!searchRes.ok) continue;

            const searchData = await searchRes.json();
            if (!searchData.items || searchData.items.length === 0) continue;

            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

            // Fetch full details with status check
            const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            // Strictly filter for embeddable videos
            const validItems = detailsData.items.filter(isVideoEmbeddable);

            allValidSongs = [...allValidSongs, ...validItems.map(mapYouTubeItemToSong)];
        } catch (error) {
            console.error(`Search failed for "${query}":`, error);
            continue;
        }
    }

    // Remove duplicates by video ID
    const uniqueSongs = allValidSongs.filter((song, index, self) =>
        index === self.findIndex((s) => s.youtubeId === song.youtubeId)
    );

    return uniqueSongs.slice(0, 5); // Return top 5 options
};

/**
 * Get trending embeddable videos
 */
export const getEmbeddableTrending = async (): Promise<Song[]> => {
    try {
        // Fetch more results to compensate for filtering
        const url = `${BASE_URL}/videos?part=snippet,contentDetails,status&chart=mostPopular&videoCategoryId=10&maxResults=50&regionCode=US&key=${YOUTUBE_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("YouTube Trending Failed");

        const data = await res.json();

        // Strictly filter for embeddable videos
        const embeddableItems = data.items.filter(isVideoEmbeddable);

        return embeddableItems.slice(0, 15).map(mapYouTubeItemToSong);
    } catch (error) {
        console.error("YouTube Trending Error:", error);
        return [];
    }
};

/**
 * Search with fallback - returns at least some results
 */
export const searchWithFallback = async (query: string): Promise<Song[]> => {
    // Try smart search first
    const smartResults = await smartSearchYouTube(query, '');

    if (smartResults.length > 0) {
        return smartResults;
    }

    // Fallback to trending if search fails
    console.warn('Smart search returned no results, falling back to trending');
    return getEmbeddableTrending();
};
