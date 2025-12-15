
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, X, Search as SearchIcon, Clock, ChevronRight, Play, TrendingUp, Music, User, Disc } from 'lucide-react';
import { searchYouTube } from '../services/youtubeService';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface Props {
  onBack: () => void;
}

type FilterType = 'all' | 'songs' | 'artists' | 'albums';

const CATEGORIES = [
  { id: '1', name: 'Replay 2025', color: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600' },
  { id: '2', name: 'Hip-Hop', color: 'bg-gradient-to-br from-blue-400 to-blue-700' },
  { id: '3', name: 'R&B', color: 'bg-gradient-to-br from-indigo-400 to-purple-700' },
  { id: '4', name: 'Hits', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  { id: '5', name: 'Holiday', color: 'bg-gradient-to-br from-red-500 to-pink-700' },
  { id: '6', name: 'Best of 2025', color: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { id: '7', name: 'Radio', color: 'bg-gradient-to-br from-red-500 to-red-600' },
  { id: '8', name: 'Spatial Audio', color: 'bg-gradient-to-br from-rose-400 to-rose-600' },
];

const TRENDING_SEARCHES = [
  'The Weeknd',
  'Taylor Swift',
  'Drake',
  'Billie Eilish',
  'Bad Bunny',
  'Ariana Grande',
  'Ed Sheeran',
  'Dua Lipa'
];

const SEARCH_SUGGESTIONS = [
  'chill lofi beats',
  'workout music',
  'study music',
  'party playlist',
  'sad songs',
  'throwback hits',
  'top 40 hits',
  'relaxing piano'
];

export const Search: React.FC<Props> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { playSong, addToQueue } = usePlayer();

  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Instant search - search as you type
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      // Show suggestions
      const filtered = [...SEARCH_SUGGESTIONS, ...searchHistory]
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);

      // Perform instant search after 500ms
      searchTimeoutRef.current = setTimeout(() => {
        performInstantSearch(query);
      }, 500);
    } else {
      setShowSuggestions(false);
      if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performInstantSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const songs = await searchYouTube(searchQuery);
      setResults(songs);
    } finally {
      setIsSearching(false);
    }
  };

  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    saveToHistory(query.trim());
    setShowSuggestions(false);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const songs = await searchYouTube(query);
      setResults(songs);
    } finally {
      setIsSearching(false);
    }
  };

  const performSearch = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    setShowSuggestions(false);
    setIsSearching(true);
    setHasSearched(true);
    searchYouTube(term).then(res => {
      setResults(res);
      setIsSearching(false);
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setShowSuggestions(false);
  };

  // Filter results based on active filter
  const filteredResults = results.filter(song => {
    if (activeFilter === 'all') return true;
    // Basic filtering - can be enhanced with more metadata
    if (activeFilter === 'songs') return true; // All results are songs
    if (activeFilter === 'artists') return song.artist.toLowerCase().includes(query.toLowerCase());
    if (activeFilter === 'albums') return song.album !== 'YouTube Music';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#000000] pb-32">
      {/* Sticky Header Zone */}
      <div className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-xl border-b border-white/5 pb-3 pt-4 md:pt-8">
        <div className="px-5 max-w-5xl mx-auto">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Search</h1>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 transition-colors group-focus-within:text-[#FA2D48]" size={20} />
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you want to hear?"
                  className="w-full bg-[#1C1C1E] text-white h-12 rounded-xl pl-11 pr-10 placeholder-gray-500 focus:bg-[#2C2C2E] focus:ring-2 focus:ring-[#FA2D48]/30 transition-all outline-none text-[16px]"
                  autoFocus
                />
              </form>
              {query && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50">
                  {suggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                      }}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <SearchIcon size={16} className="text-gray-500" />
                      <span className="text-white text-[15px]">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {query && (
              <button onClick={clearSearch} className="text-[#FA2D48] text-[16px] font-medium">
                Cancel
              </button>
            )}
          </div>

          {/* Filter Tabs - YouTube Music Style */}
          {(hasSearched || results.length > 0) && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All', icon: Music },
                { id: 'songs', label: 'Songs', icon: Music },
                { id: 'artists', label: 'Artists', icon: User },
                { id: 'albums', label: 'Albums', icon: Disc }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as FilterType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all whitespace-nowrap ${
                    activeFilter === filter.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <filter.icon size={16} />
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-6 max-w-5xl mx-auto">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#FA2D48] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Searching...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-1">
            {/* Results Header */}
            <div className="mb-4 px-1">
              <h2 className="text-white font-semibold text-[15px] text-gray-400">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} for "{query}"
              </h2>
            </div>

            {/* Results List */}
            {filteredResults.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition cursor-pointer group"
                onClick={() => playSong(song)}
              >
                {/* Thumbnail with Play Overlay */}
                <div className="relative flex-none">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title} 
                    className="w-14 h-14 rounded-lg object-cover shadow-lg bg-[#333]" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center rounded-lg transition-all">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl">
                      <Play size={14} fill="black" className="text-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-[15px] font-medium truncate mb-0.5 group-hover:text-[#FA2D48] transition-colors">
                    {song.title}
                  </h4>
                  <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                    <Music size={12} />
                    <span className="truncate">{song.artist}</span>
                    {song.duration && (
                      <>
                        <span>•</span>
                        <span>{song.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
                  title="Add to queue"
                >
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        ) : hasSearched && query ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <SearchIcon size={32} className="text-gray-600" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No results found</h3>
            <p className="text-gray-400 text-[15px] max-w-sm">
              Try different keywords or check the spelling
            </p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-5 duration-500">
            {/* Trending Searches */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 px-1">
                <TrendingUp size={18} className="text-[#FA2D48]" />
                <h3 className="text-[19px] font-bold text-white">Trending Now</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => performSearch(term)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white text-[14px] font-medium transition-all border border-white/10 hover:border-white/20"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" />
                    <h3 className="text-[19px] font-bold text-white">Recent Searches</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('search_history');
                    }} 
                    className="text-[#FA2D48] text-[14px] font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((term, i) => (
                    <div 
                      key={i} 
                      onClick={() => performSearch(term)} 
                      className="py-3 px-3 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-[16px] text-white">{term}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div>
              <h3 className="text-[19px] font-bold text-white mb-4 px-1">Browse Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => performSearch(cat.name + " music")}
                    className={`h-28 md:h-32 rounded-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform duration-200 ${cat.color} shadow-lg`}
                  >
                    <span className="absolute bottom-3 left-3 font-bold text-white text-[16px] md:text-lg leading-tight drop-shadow-lg">
                      {cat.name}
                    </span>
                    <div className="absolute -right-4 -bottom-2 w-20 h-20 bg-white/10 transform rotate-[25deg] rounded-lg backdrop-blur-sm"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
