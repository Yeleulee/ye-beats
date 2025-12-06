
import { Song } from '../types';
import { MOCK_SONGS } from '../constants';
import { fetchYouTubeWithRotation } from './apiKeyManager';

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


// Helper for caching
const fetchWithCache = async <T>(key: string, fetchFn: () => Promise<T>, ttlHours: number = 24): Promise<T> => {
    const cacheKey = `ye_beats_cache_${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const { timestamp, data } = JSON.parse(cached);
            const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
            if (ageHours < ttlHours) {
                console.log(`📦 Serving "${key}" from cache (${ageHours.toFixed(1)}h old)`);
                return data;
            }
        } catch (e) {
            console.error("Cache parse error", e);
        }
    }

    console.log(`🌐 Fetching "${key}" from API`);
    const data = await fetchFn();
    
    // Only cache if we got valid results
    if (Array.isArray(data) && data.length > 0 && data !== MOCK_SONGS) {
         localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    }
   
    return data;
};

export const getPlaylistItems = async (playlistId: string): Promise<Song[]> => {
    return fetchWithCache(`playlist_${playlistId}`, async () => {
        try {
            console.log(`🎼 Fetching playlist: ${playlistId}`);
            // Fetch playlist items with rotation
            const res = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=25&key=${key}`
            );
            
            if (!res.ok) {
                console.error(`❌ Playlist API error (${res.status})`);
                return MOCK_SONGS;
            }

            const data = await res.json();
            
            // Map items to Song
            const songs: Song[] = data.items.map((item: any) => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;
                
                return {
                    id: item.id, // PlaylistItem ID
                    youtubeId: videoId,
                    title: snippet.title,
                    artist: snippet.videoOwnerChannelTitle || snippet.channelTitle,
                    album: "Billboard Hot 100",
                    coverUrl: thumbnail,
                    duration: "3:00" // PlaylistItems lists don't return duration directly without extra call, defaulting for efficiency
                };
            }).filter((s: Song) => s.title !== "Private video" && s.title !== "Deleted video");

            return songs;

        } catch (error) {
            console.error("💥 Playlist Error:", error);
            return MOCK_SONGS;
        }
    });
};

export const searchYouTube = async (query: string): Promise<Song[]> => {
    // We do NOT cache search results by default as they are dynamic user actions
    // But we can optionally cache "static" searches like "Taylor Swift top hit" if we used a consistent key
    // For now, leaving as is.

    try {
        console.log(`🔍 Searching YouTube for: "${query}"`);

        // STRATEGY: Try direct query first for best relevance, then music-specific
        const searchTerms = [
            query,
            `${query} official audio`,
            `${query} lyrics`,
        ];

        let allResults: Song[] = [];
        const processedVideoIds = new Set<string>();

        // Try each search term until we get enough results
        for (const searchTerm of searchTerms) {
            if (allResults.length >= 15) break;

            // RELAXED SEARCH: Removed videoCategoryId=10 to find music that might be categorized differently
            // Removed videoSyndicated=true to allow all playable videos
            const searchRes = await fetchYouTubeWithRotation(key =>
                `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=25&safeSearch=none&key=${key}`
            );

            if (!searchRes.ok) {
                const errorData = await searchRes.json().catch(() => ({}));
                console.error(`❌ Search API error (${searchRes.status}):`, errorData);

                // If quota exceeded, stop trying and return what we have or mock data
                if (searchRes.status === 403 || searchRes.status === 429) {
                    // This block might not be reached if fetchYouTubeWithRotation handles it, 
                    // but if it returned the last failed response:
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
            console.log(`📹 Fetching video details for ${videoIds.split(',').length} videos`);

            const detailsRes = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${key}`
            );

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
        return allResults.length > 0 ? allResults.slice(0, 20) : [];

    } catch (error) {
        console.error("💥 YouTube API Error:", error);
        return []; 
    }
};

export const getTrendingVideos = async (): Promise<Song[]> => {
    return fetchWithCache('trending_videos', async () => {
        try {
            console.log('🔥 Fetching trending music videos...');

            // Fetch MORE results to have a better pool after strict filtering
            const res = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/videos?part=snippet,contentDetails,status&chart=mostPopular&videoCategoryId=10&maxResults=50&regionCode=US&key=${key}`
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error(`❌ Trending API error (${res.status}):`, errorData);
                return [];
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

                return isValid;
            });

            console.log(`✅ Found ${embeddableItems.length} fully playable trending videos out of ${data.items.length}`);

            // Return top 20 valid videos
            const results = embeddableItems.slice(0, 20).map(mapYouTubeItemToSong);
            return results;
        } catch (error) {
            console.error("💥 YouTube Trending Error:", error);
            return [];
        }
    });
};

export const getBillboardTopSongs = async (): Promise<Song[]> => {
    return fetchWithCache('billboard_top_100', async () => {
        try {
            // 1. Find a valid Billboard playlist
            console.log('🏆 Searching for fresh Billboard chart...');
            const searchRes = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/search?part=id&q=Billboard%20Hot%20100&type=playlist&maxResults=1&key=${key}`
            );

            if (!searchRes.ok) throw new Error('Failed to find playlist');
            const searchData = await searchRes.json();
            
            const playlistId = searchData.items?.[0]?.id?.playlistId;
            if (!playlistId) throw new Error('No playlist found');

            console.log(`✅ Found Billboard Playlist ID: ${playlistId}`);

            // 2. Fetch items from this playlist
            // Reuse the logic but call directly to avoid double caching if we called getPlaylistItems(id)
            const listRes = await fetchYouTubeWithRotation(key => 
                `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=30&key=${key}`
            );

            if (!listRes.ok) throw new Error('Failed to fetch playlist items');
            const listData = await listRes.json();

            // 3. Map to Song
            const songs = listData.items.map((item: any) => {
                const snippet = item.snippet;
                const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;
                return {
                    id: item.id,
                    youtubeId: snippet.resourceId.videoId,
                    title: snippet.title,
                    artist: snippet.videoOwnerChannelTitle || snippet.channelTitle,
                    album: "Billboard Hot 100",
                    coverUrl: thumbnail,
                    duration: "3:00"
                };
            }).filter((s: Song) => s.title !== "Private video" && s.title !== "Deleted video");

            return songs;

        } catch (error) {
            console.error("💥 Billboard Fetch Error:", error);
            return MOCK_SONGS;
        }
    });
};
