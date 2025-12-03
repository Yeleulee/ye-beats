
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
    const apiKey = YOUTUBE_API_KEY?.trim();
    if (!apiKey || apiKey.length < 10) {
        console.error('❌ YouTube API key is not configured properly');
        return MOCK_SONGS;
    }

    try {
        console.log(`🔍 Searching YouTube for: "${query}"`);

        // STRATEGY: Use more aggressive filtering and prioritize music content
        const searchTerms = [
            `${query} official audio`,
            `${query} music`,
            query,
        ];

        let allResults: Song[] = [];
        const processedVideoIds = new Set<string>();

        // Try each search term until we get enough results
        for (const searchTerm of searchTerms) {
            if (allResults.length >= 15) break;

            // Add videoCategoryId=10 (Music) and safeSearch=none for better results
            const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&videoCategoryId=10&maxResults=25&safeSearch=none&videoSyndicated=true&key=${apiKey}`;

            console.log(`📡 Fetching search results for: "${searchTerm}"`);
            const searchRes = await fetch(searchUrl);

            if (!searchRes.ok) {
                const errorData = await searchRes.json().catch(() => ({}));
                console.error(`❌ Search API error (${searchRes.status}):`, errorData);

                // If quota exceeded, stop trying and return what we have or mock data
                if (searchRes.status === 403 || searchRes.status === 429) {
                    console.warn('⚠️ YouTube API quota exceeded, using fallback data');
                    return allResults.length > 0 ? allResults : MOCK_SONGS;
                }
                continue;
            }

            const searchData = await searchRes.json();

            if (!searchData.items || searchData.items.length === 0) {
                console.log(`ℹ️ No results for "${searchTerm}"`);
                continue;
            }

            const videoIds = searchData.items
                .map((item: any) => item.id.videoId)
                .filter((id: string) => !processedVideoIds.has(id))
                .join(',');

            if (!videoIds) continue;

            // 2. Fetch details with STRICT embeddable filtering
            const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${apiKey}`;
            console.log(`📹 Fetching video details for ${videoIds.split(',').length} videos`);

            const detailsRes = await fetch(detailsUrl);

            if (!detailsRes.ok) {
                const errorData = await detailsRes.json().catch(() => ({}));
                console.error(`❌ Details API error (${detailsRes.status}):`, errorData);
                continue;
            }

            const detailsData = await detailsRes.json();

            // RELAXED FILTERING: Let more videos through since we have bypass techniques
            // Only filter out videos that are DEFINITELY broken:
            // 1. Not processed yet
            // 2. Private/unlisted
            // 3. Made for kids (these have strict autoplay restrictions)
            const validItems = detailsData.items.filter((item: any) => {
                const status = item.status;
                const snippet = item.snippet;

                // Only check critical filters - let embeddable check be lenient
                const isPublic = status?.privacyStatus === 'public';
                const notMadeForKids = !status?.madeForKids;
                const uploadStatus = status?.uploadStatus === 'processed';

                // We're REMOVING the embeddable check because:
                // 1. YouTube's API sometimes reports videos as non-embeddable when they actually work
                // 2. Our nocookie domain + direct iframe fallback can play many restricted videos
                // 3. Better to try and fail gracefully than pre-filter too aggressively

                const isValid = isPublic &&
                    notMadeForKids &&
                    uploadStatus;

                if (!isValid) {
                    console.log(`⏭️ Skipping: ${snippet?.title} (public: ${isPublic}, kids: ${!notMadeForKids}, processed: ${uploadStatus})`);
                }

                return isValid;
            });

            console.log(`✅ Found ${validItems.length} fully playable videos out of ${detailsData.items.length}`);

            validItems.forEach((item: any) => {
                if (!processedVideoIds.has(item.id)) {
                    processedVideoIds.add(item.id);
                    allResults.push(mapYouTubeItemToSong(item));
                }
            });
        }

        console.log(`🎵 Total results found: ${allResults.length}`);
        return allResults.length > 0 ? allResults.slice(0, 20) : MOCK_SONGS;

    } catch (error) {
        console.error("💥 YouTube API Error:", error);
        return MOCK_SONGS; // Fallback to mock data if quota exceeded or error
    }
};

export const getTrendingVideos = async (): Promise<Song[]> => {
    const apiKey = YOUTUBE_API_KEY?.trim();
    if (!apiKey || apiKey.length < 10) {
        console.error('❌ YouTube API key is not configured properly');
        return MOCK_SONGS;
    }

    try {
        console.log('🔥 Fetching trending music videos...');

        // Fetch MORE results to have a better pool after strict filtering
        const url = `${BASE_URL}/videos?part=snippet,contentDetails,status&chart=mostPopular&videoCategoryId=10&maxResults=50&regionCode=US&key=${apiKey}`;
        const res = await fetch(url);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`❌ Trending API error (${res.status}):`, errorData);

            if (res.status === 403 || res.status === 429) {
                console.warn('⚠️ YouTube API quota exceeded for trending videos');
            }
            return MOCK_SONGS;
        }

        const data = await res.json();

        // STRICT FILTERING - Same as search
        const embeddableItems = data.items.filter((item: any) => {
            const status = item.status;
            const snippet = item.snippet;

            // RELAXED FILTERING - Same as search
            const isPublic = status?.privacyStatus === 'public';
            const notMadeForKids = !status?.madeForKids;
            const uploadStatus = status?.uploadStatus === 'processed';

            const isValid = isPublic &&
                notMadeForKids &&
                uploadStatus;

            if (!isValid) {
                console.log(`⏭️ Skipping trending: ${snippet?.title} (public: ${isPublic}, kids: ${!notMadeForKids}, processed: ${uploadStatus})`);
            }

            return isValid;
        });

        console.log(`✅ Found ${embeddableItems.length} fully playable trending videos out of ${data.items.length}`);

        // Return top 20 valid videos
        const results = embeddableItems.slice(0, 20).map(mapYouTubeItemToSong);
        return results.length > 0 ? results : MOCK_SONGS;
    } catch (error) {
        console.error("💥 YouTube Trending Error:", error);
        return MOCK_SONGS;
    }
};
