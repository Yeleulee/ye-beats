
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Song } from "../types";
import { YOUTUBE_IDS } from "../constants";

// Helper to get client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const songSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    artist: { type: Type.STRING },
    album: { type: Type.STRING },
    duration: { type: Type.STRING },
    mood: { type: Type.STRING },
  },
  required: ["title", "artist", "album"],
};

const playlistSchema: Schema = {
  type: Type.ARRAY,
  items: songSchema,
};

// Helper to assign a random real YouTube ID to generated songs
const getRandomYoutubeId = () => {
    return YOUTUBE_IDS[Math.floor(Math.random() * YOUTUBE_IDS.length)];
}

export const getGeminiRecommendations = async (mood: string): Promise<Song[]> => {
  const client = getClient();
  if (!client) return []; // Fallback handled in component

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 6 real, popular songs that fit the mood or genre: "${mood}". Return valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: playlistSchema,
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map to our app's Song interface
    return data.map((item: any, index: number) => ({
      id: `${mood}-${index}-${Date.now()}`,
      youtubeId: getRandomYoutubeId(),
      title: item.title,
      artist: item.artist,
      album: item.album || "Single",
      duration: item.duration || "3:00",
      coverUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const searchMusicWithGemini = async (query: string): Promise<Song[]> => {
  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for songs related to "${query}". Return a list of 8 relevant tracks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: playlistSchema,
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `search-${index}-${Date.now()}`,
      youtubeId: getRandomYoutubeId(),
      title: item.title,
      artist: item.artist,
      album: item.album || "Single",
      duration: item.duration || "3:30",
      coverUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
    }));
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};
