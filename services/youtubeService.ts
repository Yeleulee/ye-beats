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

  // EXCLUDED PATTERNS - Compilation/Mix videos
  const excludedKeywords = [
    "non stop",
    "nonstop",
    "non-stop",
    "1 hour",
    "2 hour",
    "3 hour",
    "hours",
    "best of mix",
    "compilation",
    "megamix",
    "extended mix",
    "super mix",
    "all songs",
    "full album mix",
    "greatest hits mix",
    "top songs mix",
    "playlist mix",
    "continuous mix",
    "mixed by",
    "dj mix",
  ];

  // Check if title contains any excluded keywords
  const hasExcludedKeyword = excludedKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );

  // EXCLUDED: Videos longer than 10 minutes (likely compilations)
  const isTooLong = totalMinutes > 10;

  // EXCLUDED: Videos shorter than 1 minute (likely intros/outros)
  const isTooShort = totalMinutes < 1;

  // PRIORITY INDICATORS - Official content
  const officialIndicators = [
    "official",
    "vevo",
    "audio",
    "video",
    "music video",
    "lyric video",
    "visualizer",
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
  return fetchWithCache(`playlist_${playlistId}`, async () => {
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
  const cacheKey = `search_v2_${encodeURIComponent(
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
  return fetchWithCache("trending_videos", async () => {
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
  return fetchWithCache("billboard_top_100", async () => {
    try {
      console.log("🏆 Fetching Billboard Top Artists' REAL songs...");
      
      // Top Billboard artists (updated regularly)
      const topArtists = [
        "Taylor Swift",
        "Drake",
        "The Weeknd",
        "SZA",
        "Morgan Wallen",
        "Miley Cyrus",
        "Ed Sheeran",
        "Doja Cat",
        "Bad Bunny",
        "Harry Styles",
        "Rihanna",
        "Ariana Grande",
        "Billie Eilish",
        "Post Malone",
        "Travis Scott",
        "Dua Lipa",
        "Olivia Rodrigo",
        "21 Savage",
        "Metro Boomin",
        "NewJeans"
      ];

      const allSongs: Song[] = [];
      const processedVideoIds = new Set<string>();

      // Fetch top songs from each artist
      for (const artist of topArtists.slice(0, 10)) { // Limit to 10 artists to save quota
        try {
          console.log(`🎤 Fetching top song from ${artist}...`);
          
          // Search for official songs from this artist
          const searchRes = await fetchYouTubeWithRotation(
            (key) =>
              `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
                artist + " official audio"
              )}&type=video&maxResults=5&safeSearch=none&key=${key}`
          );

          if (!searchRes.ok) continue;
          const searchData = await searchRes.json();

          if (!searchData.items || searchData.items.length === 0) continue;

          // Get video IDs
          const videoIds = searchData.items
            .map((item: any) => item.id.videoId)
            .filter((id: string) => !processedVideoIds.has(id))
            .join(",");

          if (!videoIds) continue;

          // Fetch video details
          const detailsRes = await fetchYouTubeWithRotation(
            (key) =>
              `${BASE_URL}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${key}`
          );

          if (!detailsRes.ok) continue;
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
                isRealSong(item) // ← Filter compilations
              );
            })
            .slice(0, 2); // Take top 2 songs per artist

          validSongs.forEach((item: any) => {
            if (!processedVideoIds.has(item.id)) {
              processedVideoIds.add(item.id);
              allSongs.push({
                ...mapYouTubeItemToSong(item),
                album: "Billboard Hot 100",
              });
            }
          });

          console.log(
            `✅ Found ${validSongs.length} real songs from ${artist}`
          );
        } catch (err) {
          console.error(`⚠️ Error fetching songs for ${artist}:`, err);
          continue;
        }
      }

      console.log(`🎵 Total Billboard songs collected: ${allSongs.length}`);
      return allSongs.length > 0 ? allSongs : MOCK_SONGS;
    } catch (error) {
      console.error("💥 Billboard Fetch Error:", error);
      return MOCK_SONGS;
    }
  }, 12); // Cache for 12 hours
};
