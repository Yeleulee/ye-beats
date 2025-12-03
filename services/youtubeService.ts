
import { Song } from '../types';
import { YOUTUBE_API_KEY, MOCK_SONGS } from '../constants';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse ISO 8601 duration (e.g., PT4M13S) to "4:13"
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

// Helper to transform API response item to Song object
const mapYouTubeItemToSong = (item: any): Song => {
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;
    const thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url;

    return {
        id: item.id,
        youtubeId: typeof item.id === 'string' ? item.id : item.id.videoId, // Handle Search vs Video resource
        title: snippet.title,
        artist: snippet.channelTitle,
        album: "YouTube Music",
        coverUrl: thumbnail,
        duration: contentDetails ? parseDuration(contentDetails.duration) : "3:00"
    };
};

export const searchYouTube = async (query: string): Promise<Song[]> => {
    try {
        // STRATEGY 1: Search for "lyrics" or "audio" versions - these are MUCH more likely to be embeddable
        // Official music videos often have embedding restrictions
        const searchTerms = [
            `${query} lyrics`,
            `${query} audio`,
            `${query} lyric video`
        ];

        let allResults: Song[] = [];

        // Try each search term until we get enough results
        for (const searchTerm of searchTerms) {
            if (allResults.length >= 10) break;

            const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&videoCategoryId=10&maxResults=15&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
            const searchRes = await fetch(searchUrl);

            if (!searchRes.ok) continue;

            const searchData = await searchRes.json();
            if (!searchData.items || searchData.items.length === 0) continue;

            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

            // 2. Fetch details and verify embeddable status
            const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            // Filter for embeddable videos and exclude age-restricted content
            const validItems = detailsData.items.filter((item: any) => {
                const isEmbeddable = item.status?.embeddable === true;
                const isPublic = item.status?.privacyStatus === 'public';
                const notRestricted = !item.contentDetails?.contentRating?.ytRating;

                return isEmbeddable && isPublic && notRestricted;
            });

            allResults = [...allResults, ...validItems.map(mapYouTubeItemToSong)];
        }

        // Remove duplicates based on title similarity
        const uniqueResults = allResults.filter((song, index, self) =>
            index === self.findIndex((s) => s.title.toLowerCase() === song.title.toLowerCase())
        ).slice(0, 10);

        return uniqueResults.length > 0 ? uniqueResults : MOCK_SONGS;

    } catch (error) {
        console.error("YouTube API Error:", error);
        return MOCK_SONGS; // Fallback to mock data if quota exceeded or error
    }
};

export const getTrendingVideos = async (): Promise<Song[]> => {
    try {
        // Fetch more results to have a better pool after filtering
        const url = `${BASE_URL}/videos?part=snippet,contentDetails,status&chart=mostPopular&videoCategoryId=10&maxResults=30&regionCode=US&key=${YOUTUBE_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("YouTube Trending Failed");

        const data = await res.json();

        // Aggressively filter for embeddable, public, non-restricted videos
        const embeddableItems = data.items.filter((item: any) => {
            const isEmbeddable = item.status?.embeddable === true;
            const isPublic = item.status?.privacyStatus === 'public';
            const notRestricted = !item.contentDetails?.contentRating?.ytRating;
            const notLivestream = item.snippet?.liveBroadcastContent === 'none';

            return isEmbeddable && isPublic && notRestricted && notLivestream;
        });

        // Return top 10 valid videos
        return embeddableItems.slice(0, 10).map(mapYouTubeItemToSong);
    } catch (error) {
        console.error("YouTube Trending Error:", error);
        return MOCK_SONGS;
    }
};
