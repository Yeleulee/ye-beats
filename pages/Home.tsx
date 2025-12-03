
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrendingVideos, searchYouTube } from '../services/youtubeService';
import { Song } from '../types';

interface Props {
  onSearchPress: () => void;
}

export const Home: React.FC<Props> = ({ onSearchPress }) => {
  const { playSong } = usePlayer();
  const [recommended, setRecommended] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const GENRES = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Classical', 'Lofi'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Initial load: 
        // We use "NCS" (NoCopyrightSounds) or "Lofi" for the default recommendation 
        // because these are almost guaranteed to be embeddable globally.
        // This avoids the "Error 150" bad first impression.
        const [recData, trendData] = await Promise.all([
            searchYouTube("NCS electronic hits"),
            getTrendingVideos(),
        ]);
        
        setRecommended(recData);
        setTrending(trendData);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterSelect = async (genre: string) => {
    const newFilter = activeFilter === genre ? null : genre;
    setActiveFilter(newFilter);
    setLoading(true);

    try {
        if (newFilter) {
            // Fetch specific genre recommendations via Search
            // Append "mix" to find compilations or playlists which are often open
            const genreData = await searchYouTube(`${genre} music mix`);
            setRecommended(genreData);
        } else {
            // Reset to default
            const defaultData = await searchYouTube("NCS electronic hits");
            setRecommended(defaultData);
        }
    } catch (e) {
        console.error("Error fetching filtered songs", e);
    } finally {
        setLoading(false);
    }
  };

  const SkeletonCard = () => (
    <div className="flex-none w-36 snap-start">
      <div className="w-36 h-36 mb-2 bg-white/10 rounded-lg animate-pulse"></div>
      <div className="h-4 w-28 bg-white/10 rounded mb-1 animate-pulse"></div>
      <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
    </div>
  );

  const SkeletonSection = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="h-6 w-40 bg-white/10 rounded animate-pulse"></div>
      </div>
      <div className="flex overflow-x-auto space-x-4 px-4 pb-4 no-scrollbar">
         {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  const SongSection = ({ title, songs }: { title: string, songs: Song[] }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button className="text-xs font-medium text-gray-400 border border-gray-700 rounded-full px-3 py-1">More</button>
      </div>
      <div className="flex overflow-x-auto space-x-4 px-4 pb-4 no-scrollbar snap-x">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className="flex-none w-36 snap-start group cursor-pointer"
            onClick={() => playSong(song)}
          >
            <div className="relative w-36 h-36 mb-2">
                <img 
                  src={song.coverUrl} 
                  alt={song.title} 
                  className="w-full h-full object-cover rounded shadow-lg opacity-90 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Play fill="white" className="text-white" />
                </div>
            </div>
            <h3 className="text-white text-sm font-medium truncate">{song.title}</h3>
            <div className="flex items-center text-gray-400 text-xs">
              <span className="truncate flex-1">{song.artist}</span>
              <span className="flex-shrink-0 ml-1">• {song.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-32 pt-32">
        {/* Sticky Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-lg z-30 flex flex-col border-b border-white/5 transition-all duration-300">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/20">
                        <Play size={14} fill="white" className="text-white ml-0.5" />
                    </div>
                    <span className="font-bold text-xl tracking-tighter">Music</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={onSearchPress} className="p-1 rounded-full active:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </button>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs flex items-center justify-center font-bold shadow-lg">V</div>
                </div>
            </div>

            <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                {GENRES.map(genre => {
                    const isActive = activeFilter === genre;
                    return (
                        <button 
                            key={genre} 
                            onClick={() => handleFilterSelect(genre)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive 
                                ? 'bg-white text-black scale-105 shadow-md' 
                                : 'bg-[#212121] text-white border border-white/10 hover:bg-[#303030] active:scale-95'
                            }`}
                        >
                            {genre}
                        </button>
                    );
                })}
            </div>
        </div>

      {loading ? (
        <div className="pt-2 animate-in fade-in duration-300">
            <SkeletonSection />
            <SkeletonSection />
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
            <SongSection title={activeFilter ? `${activeFilter} Picks` : "Recommended"} songs={recommended} />
            <SongSection title="Trending Now" songs={trending} />
            {/* Mix them for a 3rd section */}
            <SongSection title="Quick Picks" songs={[...trending].reverse()} />
        </div>
      )}
    </div>
  );
};
