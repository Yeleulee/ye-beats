
import { Song } from "../types";
import { YOUTUBE_IDS } from "../constants";

// Helper to assign a random real YouTube ID to generated songs
const getRandomYoutubeId = () => {
    return YOUTUBE_IDS[Math.floor(Math.random() * YOUTUBE_IDS.length)];
}

const MOCK_TITLES = ["Neon Lights", "City Rain", "Midnight Drive", "Ocean Waves", "Solar Flare", "Digital Love"];
const MOCK_ARTISTS = ["The Synths", "Lofi Girl", "Retro Wave", "Chill Vibes", "Future Sound", "Electro Hearts"];

export const getGeminiRecommendations = async (mood: string): Promise<Song[]> => {
    // Return mock data without API call
    return Array(6).fill(null).map((_, index) => ({
      id: `${mood}-${index}-${Date.now()}`,
      youtubeId: getRandomYoutubeId(),
      title: `${mood} ${MOCK_TITLES[index % MOCK_TITLES.length]}`,
      artist: MOCK_ARTISTS[index % MOCK_ARTISTS.length],
      album: "AI Vibes",
      duration: "3:00",
      coverUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
    }));
};

export const searchMusicWithGemini = async (query: string): Promise<Song[]> => {
    // Return empty or basic mock search
    return [];
};
