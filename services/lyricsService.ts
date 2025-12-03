import { GoogleGenAI, Type, Schema } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface LyricLine {
  text: string;
  timestamp: number; // Time in seconds when this line should be highlighted
}

const lyricsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          timestamp: { type: Type.NUMBER },
        },
        required: ["text", "timestamp"],
      },
    },
  },
  required: ["lines"],
};

export const fetchLyrics = async (
  songTitle: string,
  artist: string,
  duration: number
): Promise<LyricLine[]> => {
  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate synchronized lyrics with timestamps for the song "${songTitle}" by ${artist}. 
      The song duration is ${Math.floor(duration)} seconds. 
      Return a JSON array of lyric lines with their corresponding timestamps in seconds.
      Each line should have a "text" field (the lyric line) and a "timestamp" field (when the line starts, in seconds).
      Space the timestamps evenly throughout the song duration.
      Return approximately 16-24 lines depending on the song.
      IMPORTANT: Only return actual lyrics, do not include [Verse], [Chorus], or any markup.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: lyricsSchema,
      },
    });

    const data = JSON.parse(response.text || '{"lines":[]}');
    return data.lines || [];
  } catch (error) {
    console.error("Gemini Lyrics Error:", error);
    // Fallback with generic timestamps
    return generateFallbackLyrics(duration);
  }
};

// Fallback in case API fails
const generateFallbackLyrics = (duration: number): LyricLine[] => {
  const fallbackLines = [
    "Loading lyrics...",
    "Enjoy the music",
    "Feel the rhythm",
    "Lost in the sound",
  ];
  
  const interval = duration / fallbackLines.length;
  return fallbackLines.map((text, index) => ({
    text,
    timestamp: interval * index,
  }));
};
