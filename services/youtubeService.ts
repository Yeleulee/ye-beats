import { Song } from "../types";
import { MOCK_SONGS } from "../constants";
import { fetchYouTubeWithRotation } from "./apiKeyManager";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

// Helper to parse ISO 8601 duration (e.g., PT4M13S) to "4:13"
const parseDuration = (duration: string): string => {
  if (!duration) return "0:00";
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";

  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "").replace("M", "");
  const seconds = (match[3] || "").replace("S", "");

  let result = "";
  if (hours) {
    result += `${hours}:`;
    result += `${minutes.padStart(2, "0") || "00"}:`;
  } else {
    result += `${minutes || "0"}:`;
  }
  result += seconds.padStart(2, "0") || "00";

  return result;
};

// Helper to filter out compilation/mix videos and keep REAL individual songs
const isRealSong = (item: any): boolean => {
  const title = item.snippet?.title?.toLowerCase() || "";
  const description = item.snippet?.description?.toLowerCase() || "";
  const channelTitle = item.snippet?.channelTitle?.toLowerCase() || "";
  const duration = item.contentDetails?.duration || "";

  // Parse duration to minutes
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt((match?.[1] || "0H").replace("H", "")) || 0;
  const minutes = parseInt((match?.[2] || "0M").replace("M", "")) || 0;
  const totalMinutes = hours * 60 + minutes;

  // EXCLUDED PATTERNS - Compilation/Mix videos (EXPANDED LIST)
  const excludedKeywords = [
    // Duration indicators
    "non stop",
    "nonstop", 
    "non-stop",
    "1 hour",
    "2 hour",
    "3 hour",
    "4 hour",
    "5 hour",
    "hours",
    "hour mix",
    "hour of",
    // Mix/Compilation indicators
    "best of mix",
    "compilation",
    "megamix",
    "mega mix",
    "extended mix",
    "super mix",
    "all songs",
    "full album mix",
    "full album",
    "greatest hits mix",
    "greatest hits",
    "top songs mix",
    "top 10",
    "top 20",
    "top 50",
    "top 100",
    "playlist mix",
    "playlist",
    "continuous mix",
    "continuous play",
    "mixed by",
    "dj mix",
    "dj set",
    "live mix",
    "remix compilation",
    "hits collection",
    "best songs",
    "all hits",
    "music mix",
    "songs mix",
    // Other exclusions
    "full concert",
    "live concert",
    "live performance",
    "medley",
    "mashup collection",
    "back to back",
    "b2b",
    "radio mix",
    "club mix",
    "party mix",
    "workout mix",
    "gym mix",
  ];

  // Check if title contains any excluded keywords
  const hasExcludedKeyword = excludedKeywords.some(
    (keyword) => title.includes(keyword) || description.slice(0, 200).includes(keyword)
  );

  // EXCLUDED: Videos longer than 8 minutes (likely compilations) - STRICTER LIMIT
  const isTooLong = totalMinutes > 8;

  // EXCLUDED: Videos shorter than 1.5 minutes (likely intros/outros/shorts)
  const isTooShort = totalMinutes < 1.5;

  // PRIORITY INDICATORS - Official content
  const officialIndicators = [
    "official",
    "vevo",
    "official audio",
    "official video",
    "music video",
    "lyric video",
    "lyrics",
    "visualizer",
    "audio",
  ];

  const hasOfficialIndicator = officialIndicators.some(
    (keyword) => title.includes(keyword) || channelTitle.includes(keyword)
  );

  // Filter logic
  if (hasExcludedKeyword) {
    console.log(`🚫 Filtered out compilation: "${item.snippet?.title}"`);
    return false;
  }

  if (isTooLong) {
    console.log(
      `🚫 Filtered out long video (${totalMinutes}min): "${item.snippet?.title}"`
    );
    return false;
  }

  if (isTooShort) {
    console.log(
      `🚫 Filtered out short video (${totalMinutes}min): "${item.snippet?.title}"`
    );
    return false;
  }

  // Prefer official content
  if (hasOfficialIndicator) {
    console.log(`✅ Official song detected: "${item.snippet?.title}"`);
  }

  return true;
};

// Helper to transform API response item to Song object
const mapYouTubeItemToSong = (item: any): Song => {
  const snippet = item.snippet;
  const contentDetails = item.contentDetails;
  const thumbnail =
    snippet.thumbnails.high?.url ||
    snippet.thumbnails.medium?.url ||
    snippet.thumbnails.default?.url;

  return {
    id: item.id,
    youtubeId: typeof item.id === "string" ? item.id : item.id.videoId, // Handle Search vs Video resource
    title: snippet.title,
    artist: snippet.channelTitle,
    album: "YouTube Music",
    coverUrl: thumbnail,
    duration: contentDetails ? parseDuration(contentDetails.duration) : "3:00",
  };
};

// Helper for caching
const fetchWithCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlHours: number = 24
): Promise<T> => {
  const cacheKey = `ye_beats_cache_${key}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (ageHours < ttlHours) {
        console.log(
          `📦 Serving "${key}" from cache (${ageHours.toFixed(1)}h old)`
        );
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
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  }

  return data;
};

export const getPlaylistItems = async (playlistId: string): Promise<Song[]> => {
  return fetchWithCache(`playlist_${playlistId}_v4`, async () => {
    try {
      console.log(`🎼 Fetching playlist: ${playlistId}`);
      // Fetch playlist items with rotation
      const res = await fetchYouTubeWithRotation(
        (key) =>
          `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=25&key=${key}`
      );

      if (!res.ok) {
        console.error(`❌ Playlist API error (${res.status})`);
        return MOCK_SONGS;
      }

      const data = await res.json();

      // Map items to Song
      const songs: Song[] = data.items
        .map((item: any) => {
          const snippet = item.snippet;
          const videoId = snippet.resourceId.videoId;
          const thumbnail =
            snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;

          return {
            id: item.id, // PlaylistItem ID
            youtubeId: videoId,
            title: snippet.title,
            artist: snippet.videoOwnerChannelTitle || snippet.channelTitle,
            album: "Billboard Hot 100",
            coverUrl: thumbnail,
            duration: "3:00", // PlaylistItems lists don't return duration directly without extra call, defaulting for efficiency
          };
        })
        .filter(
          (s: Song) =>
            s.title !== "Private video" && s.title !== "Deleted video"
        );

      return songs;
    } catch (error) {
      console.error("💥 Playlist Error:", error);
      return MOCK_SONGS;
    }
  });
};

export const searchYouTube = async (query: string): Promise<Song[]> => {
  // ENABLED Caching to save quota
  const cacheKey = `search_v4_${encodeURIComponent(
    query.toLowerCase().trim()
  )}`;

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        console.log(`🔍 Searching YouTube for: "${query}"`);

        // STRATEGY: Single optimized search to minimize quota usage
        const searchTerms = [`${query} official audio`];

        let allResults: Song[] = [];
        const processedVideoIds = new Set<string>();

        // Try each search term until we get enough results
        for (const searchTerm of searchTerms) {
          if (allResults.length >= 8) break; // Reduced target to minimize quota usage

          // OPTIMIZED SEARCH - Reduced maxResults to save quota
          const searchRes = await fetchYouTubeWithRotation(
            (key) =>
              `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
                searchTerm
              )}&type=video&maxResults=10&safeSearch=none&key=${key}`
          );

          if (!searchRes.ok) {
            const errorData = await searchRes.json().catch(() => ({}));
            console.error(
              `❌ Search API error (${searchRes.status}):`,
              errorData
            );

            if (searchRes.status === 403 || searchRes.status === 429) {
              console.warn(
                "⚠️ YouTube API quota exceeded, using fallback data"
              );
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
            .join(",");

          if (!videoIds) continue;

          // 2. Fetch details
          console.log(
            `📹 Fetching video details for ${videoIds.split(",").length} videos`
          );

          const detailsRes = await fetchYouTubeWithRotation(
            (key) =>
              `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${key}`
          );

          if (!detailsRes.ok) {
            continue;
          }

          const detailsData = await detailsRes.json();

          // STRICT FILTERING - Filter out compilations and keep REAL songs
          const validItems = detailsData.items.filter((item: any) => {
            const status = item.status;
            const snippet = item.snippet;

            const isPublic = status?.privacyStatus === "public";
            const notMadeForKids = !status?.madeForKids;
            const uploadStatus = status?.uploadStatus === "processed";

            const isValid =
              isPublic && notMadeForKids && uploadStatus && isRealSong(item); // ← NEW: Filter out compilations

            return isValid;
          });

          console.log(`✅ Found ${validItems.length} fully playable videos`);

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
    },
    6
  ); // Cache for 6 hours
};

export const getTrendingVideos = async (): Promise<Song[]> => {
  return fetchWithCache("trending_videos_v4", async () => {
    try {
      console.log("🔥 Fetching trending music videos...");

      // Fetch MORE results to have a better pool after strict filtering
      const res = await fetchYouTubeWithRotation(
        (key) =>
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
        const isPublic = status?.privacyStatus === "public";
        const notMadeForKids = !status?.madeForKids;
        const uploadStatus = status?.uploadStatus === "processed";

        const isValid = isPublic && notMadeForKids && uploadStatus && isRealSong(item); // ← NEW: Filter compilations

        return isValid;
      });

      console.log(
        `✅ Found ${embeddableItems.length} fully playable trending videos out of ${data.items.length}`
      );

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
  return fetchWithCache("billboard_top_100_v4", async () => {
    try {
      console.log("🏆 Fetching Billboard Top Artists' REAL songs...");
      
      // REDUCED to 6 artists to save quota (was 12)
      const artistsWithHits = [
        { artist: "Taylor Swift", song: "Anti-Hero" },
        { artist: "The Weeknd", song: "Blinding Lights" },
        { artist: "Drake", song: "Rich Flex" },
        { artist: "SZA", song: "Kill Bill" },
        { artist: "Harry Styles", song: "As It Was" },
        { artist: "Miley Cyrus", song: "Flowers" },
      ];

      const allSongs: Song[] = [];
      const allVideoIds: string[] = [];

      // Step 1: Batch all searches together
      for (const { artist, song } of artistsWithHits) {
        try {
          console.log(`🎤 Searching \"${song}\" by ${artist}...`);
          
          const searchQuery = `${artist} ${song} official audio`;
          const searchRes = await fetchYouTubeWithRotation(
            (key) =>
              `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
                searchQuery
              )}&type=video&maxResults=1&videoDuration=short&safeSearch=none&key=${key}`
          );

          if (!searchRes.ok) continue;
          const searchData = await searchRes.json();

          if (searchData.items && searchData.items.length > 0) {
            allVideoIds.push(searchData.items[0].id.videoId);
          }
        } catch (err) {
          console.error(`⚠️ Error searching for ${artist}:`, err);
          continue;
        }
      }

      if (allVideoIds.length === 0) {
        console.warn("⚠️ No Billboard videos found, using mock data");
        return MOCK_SONGS;
      }

      // Step 2: Fetch ALL video details in ONE batch request (saves quota!)
      console.log(`📦 Fetching details for ${allVideoIds.length} videos in batch...`);
      const detailsRes = await fetchYouTubeWithRotation(
        (key) =>
          `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${allVideoIds.join(",")}&key=${key}`
      );

      if (!detailsRes.ok) {
        console.error("❌ Failed to fetch video details");
        return MOCK_SONGS;
      }

      const detailsData = await detailsRes.json();

      // Filter for REAL songs only
      const validSongs = detailsData.items
        .filter((item: any) => {
          const status = item.status;
          const isPublic = status?.privacyStatus === "public";
          const notMadeForKids = !status?.madeForKids;
          const uploadStatus = status?.uploadStatus === "processed";
          return (
            isPublic &&
            notMadeForKids &&
            uploadStatus &&
            isRealSong(item)
          );
        })
        .map((item: any) => ({
          ...mapYouTubeItemToSong(item),
          album: "Billboard Hot 100",
        }));

      console.log(`✅ Billboard: ${validSongs.length} real songs collected`);
      return validSongs.length > 0 ? validSongs : MOCK_SONGS;
    } catch (error) {
      console.error("💥 Billboard Fetch Error:", error);
      return MOCK_SONGS;
    }
  }, 24); // Cache for 24 hours (increased from 12)
};
