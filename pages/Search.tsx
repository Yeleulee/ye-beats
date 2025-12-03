
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, X, Search as SearchIcon, Clock, ListPlus } from 'lucide-react';
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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { playSong, addToQueue } = usePlayer();

  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    saveToHistory(query.trim());
    setIsSearching(true);
    const songs = await searchYouTube(query);
    setResults(songs);
    setIsSearching(false);
  };

  const performSearch = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    setIsSearching(true);
    searchYouTube(term).then(res => {
      setResults(res);
      setIsSearching(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] pt-4 pb-32">
      {/* Search Header */}
      <div className="sticky top-0 bg-[#121212] z-30 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 px-2 max-w-4xl mx-auto w-full">
          <button onClick={onBack} className="p-2 md:hidden">
            <ArrowLeft className="text-white" />
          </button>
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, vibes..."
              className="w-full bg-[#212121] text-white px-4 py-3 pl-12 rounded-full focus:bg-[#303030] transition placeholder-gray-500 outline-none border border-transparent focus:border-white/10"
              autoFocus
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
          <button className="p-2 bg-[#212121] rounded-full md:hidden">
            <Mic size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 max-w-4xl mx-auto">
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
                className="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
                onClick={() => playSong(song)}
              >
                <img src={song.coverUrl} alt={song.title} className="w-14 h-14 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate group-hover:text-red-500 transition-colors">{song.title}</h4>
                  <p className="text-gray-400 text-sm truncate">{song.artist} • {song.album}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(song);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100"
                  title="Add to Queue"
                >
                  <ListPlus size={20} />
                </button>
                <span className="text-gray-500 text-xs whitespace-nowrap">{song.duration}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Recent Searches</h3>
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('search_history');
                    }}
                    className="text-xs text-red-500 font-medium hover:text-red-400"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
                      onClick={() => performSearch(term)}
                    >
                      <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                        <Clock size={16} className="text-gray-500" />
                        <span>{term}</span>
                      </div>
                      <button
                        onClick={(e) => removeFromHistory(term, e)}
                        className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <h3 className="text-white font-bold mb-4">Trending Searches</h3>
              <div className="flex flex-wrap gap-3">
                {['Lo-fi beats', 'Top hits 2024', 'Workout mix', 'The Weeknd', 'Rock classics'].map(term => (
                  <button
                    key={term}
                    onClick={() => performSearch(term)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#212121] rounded-full text-sm font-medium text-gray-300 hover:text-white transition hover:bg-[#303030]"
                  >
                    <SearchIcon size={14} />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
