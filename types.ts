
export interface Song {
  id: string;
  youtubeId?: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string; // Display string "3:45"
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  songs: Song[];
}

export enum Tab {
  HOME = 'Home',
  EXPLORE = 'Explore',
  LIBRARY = 'Library',
  SEARCH = 'Search'
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isMinimized: boolean;
  queue: Song[];
  progress: number; // Current time in seconds
  duration: number; // Total duration in seconds
  seekRequest: number | null; // Timestamp to seek to, or null
  videoMode: boolean; // Toggle between audio-only (art) and video
}
