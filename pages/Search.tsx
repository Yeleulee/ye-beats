
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, X, Search as SearchIcon, Clock, ChevronRight, Play } from 'lucide-react';
import { searchYouTube } from '../services/youtubeService';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface Props {
  onBack: () => void;
}

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
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
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
    setIsSearching(true);
    searchYouTube(term).then(res => {
      setResults(res);
      setIsSearching(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-32">
      {/* Sticky Header Zone */}
      <div className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl border-b border-white/5 pb-4 pt-4 md:pt-8 transition-colors duration-500">
        <div className="px-5 max-w-5xl mx-auto">
          {/* Title Row (Hidden when searching if improved interaction preferred, but maintained for now) */}
          <div className="flex items-center justify-between mb-4">
             <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Search</h1>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden border border-white/10">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-colors group-focus-within:text-white" size={18} />
                <form onSubmit={handleSearch} className="w-full">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Artists, Songs, Lyrics, and More"
                        className="w-full bg-[#1C1C1E] text-white h-10 rounded-xl pl-10 pr-10 placeholder-gray-500 focus:bg-[#2C2C2E] transition-all outline-none text-[17px]"
                    />
                </form>
                {query && (
                    <button 
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        <X size={16} fill="currentColor" />
                    </button>
                )}
            </div>
            {query && (
                 <button onClick={() => { setQuery(''); setResults([]); }} className="text-[#FA2D48] text-[17px]">
                    Cancel
                 </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 max-w-5xl mx-auto">
        {results.length > 0 || isSearching ? (
             <div className="space-y-4">
                {isSearching && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#FA2D48] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                {!isSearching && results.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition cursor-pointer group"
                    onClick={() => playSong(song)}
                  >
                    <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-[4px] object-cover shadow-sm bg-[#333]" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-white/5 pb-2 ml-1 h-14">
                      <h4 className="text-white text-[16px] font-normal truncate">{song.title}</h4>
                      <p className="text-gray-400 text-[14px] truncate">{song.artist} • {song.album}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    >
                        <ChevronRight className="text-gray-500" />
                    </button>
                  </div>
                ))}
             </div>
        ) : (
            <div className="animate-in slide-in-from-bottom-5 duration-500">
                {/* Search History */}
                {searchHistory.length > 0 && (
                     <div className="mb-8">
                        <div className="flex justify-between items-center mb-0 px-1">
                            <h3 className="text-[19px] font-bold text-white">Recent Searches</h3>
                            <button onClick={() => setSearchHistory([])} className="text-[#FA2D48] text-[15px]">Clear</button>
                        </div>
                        <div className="divide-y divide-white/10">
                            {searchHistory.map((term, i) => (
                                <div key={i} onClick={() => performSearch(term)} className="py-3 flex items-center justify-between cursor-pointer active:opacity-50">
                                    <span className="text-[17px] text-[#FA2D48]">{term}</span>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </div>
                            ))}
                        </div>
                     </div>
                )}

                {/* Categories Grid */}
                <div>
                    <h3 className="text-[19px] font-bold text-white mb-4 px-1">Browse Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {CATEGORIES.map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => performSearch(cat.name + " music playlist")}
                                className={`h-28 md:h-36 rounded-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform duration-200 ${cat.color}`}
                            >
                                <span className="absolute bottom-3 left-3 font-bold text-white text-[15px] md:text-lg leading-tight w-2/3">
                                    {cat.name}
                                </span>
                                {/* Decorative elements to simulate cover art collage */}
                                <div className="absolute -right-4 -bottom-2 w-16 h-16 bg-white/20 transform rotate-[25deg] rounded-md backdrop-blur-sm"></div>
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
