
export const THEME = {
  bg: '#121212', // YouTube Music dark
  bgSecondary: '#212121',
  accent: '#FF0000', // YouTube Red
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  navBar: 'rgba(18, 18, 18, 0.95)',
};

export const YOUTUBE_API_KEY = 'AIzaSyAYOFHxyKNy_49L0AH53ORx3ArRbsmpSSI';

// Fallback IDs if API quota is reached
// Using NoCopyrightSounds (NCS) which are globally embeddable
export const YOUTUBE_IDS = [
  'K4DyBUG242c', // Cartoon - On & On
  'bM7SZ5SBzyY', // Alan Walker - Fade
  '3nQNiWdeH2Q', // Frakture - Hindsight
  'J2X5mJ3HDYE', // Janji - Heroes Tonight
  'p7ZsBPK656s', // K-391 - Summertime
];

export const MOCK_SONGS = [
  { id: '1', youtubeId: 'K4DyBUG242c', title: 'On & On', artist: 'Cartoon', album: 'NCS Release', duration: '3:28', coverUrl: 'https://i.ytimg.com/vi/K4DyBUG242c/hqdefault.jpg' },
  { id: '2', youtubeId: 'bM7SZ5SBzyY', title: 'Fade', artist: 'Alan Walker', album: 'NCS Release', duration: '4:20', coverUrl: 'https://i.ytimg.com/vi/bM7SZ5SBzyY/hqdefault.jpg' },
  { id: '3', youtubeId: '3nQNiWdeH2Q', title: 'Hindsight', artist: 'Frakture', album: 'NCS Release', duration: '3:23', coverUrl: 'https://i.ytimg.com/vi/3nQNiWdeH2Q/hqdefault.jpg' },
];
