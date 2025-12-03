
import React, { useState } from 'react';
import { ArrowLeft, Mic, X, Search as SearchIcon } from 'lucide-react';
import { searchYouTube } from '../services/youtubeService';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface Props {
  onBack: () => void;
}

export const Search: React.FC<Props> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { playSong } = usePlayer();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    const songs = await searchYouTube(query);
    setResults(songs);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] pt-4 pb-32">
        {/* Search Header */}
      <div className="flex items-center gap-2 px-2 sticky top-0 bg-[#121212] z-30 pb-2 border-b border-white/5">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="text-white" />
        </button>
        <form onSubmit={handleSearch} className="flex-1 relative">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, vibes..."
            className="w-full bg-[#212121] text-white px-4 py-2 pl-4 pr-10 rounded-full focus:bg-[#303030] transition placeholder-gray-500"
            autoFocus
            />
            {query.length > 0 && (
                <button 
                    type="button" 
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            )}
        </form>
        <button className="p-2 bg-[#212121] rounded-full">
            <Mic size={20} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {isSearching ? (
           <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Searching YouTube...</p>
            </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Top Results</h3>
            {results.map((song) => (
              <div 
                key={song.id} 
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
                onClick={() => playSong(song)}
              >
                <img src={song.coverUrl} alt={song.title} className="w-14 h-14 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{song.title}</h4>
                  <p className="text-gray-400 text-sm truncate">{song.artist} • {song.album}</p>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">{song.duration}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <h3 className="text-white font-bold mb-4">Trending Searches</h3>
            <div className="flex flex-wrap gap-3">
                {['Lo-fi beats', 'Top hits 2024', 'Workout mix', 'The Weeknd', 'Rock classics'].map(term => (
                    <button 
                        key={term}
                        onClick={() => {
                            setQuery(term);
                            // Trigger search manually
                            setIsSearching(true);
                            searchYouTube(term).then(res => {
                                setResults(res);
                                setIsSearching(false);
                            });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#212121] rounded-full text-sm font-medium text-gray-300 hover:text-white transition"
                    >
                        <SearchIcon size={14} />
                        {term}
                    </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
