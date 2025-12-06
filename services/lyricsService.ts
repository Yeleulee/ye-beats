
import { Type, Schema } from "@google/genai"; // Keep if needed for types or remove if unused. Actually I'll remove the import if I don't use it.
// Removing @google/genai import completely

export interface LyricLine {
  text: string;
  timestamp: number;
}

export const fetchLyrics = async (
  songTitle: string,
  artist: string,
  duration: number
): Promise<LyricLine[]> => {
    // Immediately return fallback lyrics as Gemini is disabled
    return generateFallbackLyrics(duration);
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
