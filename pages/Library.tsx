
import React, { useState } from 'react';
import { ListMusic, Mic2, Disc, Music, Download, ChevronRight, Play, ArrowLeft, FolderHeart } from 'lucide-react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { Song } from '../types';

export const Library: React.FC = () => {
    const { playSong } = usePlayer();
    const [view, setView] = useState<'main' | 'playlists' | 'artists' | 'albums' | 'songs' | 'downloaded'>('main');

    const LibraryItem = ({ icon: Icon, label, target }: { icon: any, label: string, target: typeof view }) => (
        <div 
            onClick={() => setView(target)}
            className="flex items-center gap-4 py-3 active:bg-white/5 cursor-pointer group"
        >
            <Icon className="text-[#FA2D48]" size={24} />
            <div className="flex-1 flex items-center justify-between border-b border-white/10 pb-3 group-last:border-0 pl-1">
                <h4 className="text-white font-normal text-[20px]">{label}</h4>
                <ChevronRight size={18} className="text-gray-600" />
            </div>
        </div>
    );

    const SimpleList = ({ items, type }: { items: any[], type: 'artist' | 'album' | 'playlist' }) => (
        <div className="flex flex-col">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 active:bg-white/5 cursor-pointer">
                    <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center text-gray-500">
                        {type === 'artist' ? <Mic2 size={20} /> : type === 'album' ? <Disc size={20} /> : <ListMusic size={20} />}
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-[16px]">{item.name || item.title}</h4>
                        <p className="text-gray-500 text-sm">{item.count || '0'} songs</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const SongList = ({ songs }: { songs: Song[] }) => (
        <div className="flex flex-col">
            {songs.map((song) => (
                <div 
                    key={song.id} 
                    className="flex items-center gap-4 py-2 active:bg-white/5 cursor-pointer"
                    onClick={() => playSong(song)}
                >
                    <img src={song.coverUrl} className="w-12 h-12 rounded object-cover bg-[#222]" />
                    <div className="flex-1 border-b border-white/5 pb-2">
                        <h4 className="text-white font-medium text-[16px] truncate">{song.title}</h4>
                        <p className="text-gray-500 text-sm truncate">{song.artist}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'playlists':
                return <SimpleList type="playlist" items={[{ name: 'Gym Hype', count: 24 }, { name: 'Late Night', count: 12 }, { name: 'Favorites', count: 142 }]} />;
            case 'artists':
                return <SimpleList type="artist" items={[{ name: 'The Weeknd', count: 15 }, { name: 'Drake', count: 10 }, { name: 'Kendrick Lamar', count: 8 }]} />;
            case 'albums':
                 return <SimpleList type="album" items={[{ name: 'After Hours', count: 14 }, { name: 'DAMN.', count: 14 }]} />;
            case 'songs':
            case 'downloaded':
                return <SongList songs={MOCK_SONGS} />;
            default:
                return (
                    <>
                        {/* Main List */}
                        <div className="flex flex-col mb-8 mt-2">
                            <LibraryItem icon={ListMusic} label="Playlists" target="playlists" />
                            <LibraryItem icon={Mic2} label="Artists" target="artists" />
                            <LibraryItem icon={Disc} label="Albums" target="albums" />
                            <LibraryItem icon={Music} label="Songs" target="songs" />
                            <LibraryItem icon={Download} label="Downloaded" target="downloaded" />
                        </div>

                        {/* Recently Added Grid */}
                        <div>
                             <div className="flex justify-between items-end mb-4">
                                <h2 className="text-[22px] font-bold text-white">Recently Added</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {MOCK_SONGS.concat(MOCK_SONGS).map((song, i) => (
                                    <div 
                                        key={i}
                                        className="flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform"
                                        onClick={() => playSong(song)}
                                    >
                                        <div className="aspect-square bg-[#222] rounded-lg overflow-hidden relative shadow-lg">
                                            <img src={song.coverUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium text-[15px] truncate">{song.title}</h4>
                                            <p className="text-gray-400 text-[14px] truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] pb-32">
            {/* Header */}
            <div className="pt-4 md:pt-10 px-5 sticky top-0 z-20 bg-[#000000]/90 backdrop-blur-xl pb-2 border-b border-white/5 flex items-center gap-2">
                {view !== 'main' && (
                    <button onClick={() => setView('main')} className="flex items-center text-[#FA2D48] text-[17px] -ml-2 pr-2">
                        <ArrowLeft size={22} />
                        Library
                    </button>
                )}
                <h1 className={`text-3xl md:text-4xl font-bold text-white tracking-tight flex-1 ${view !== 'main' ? 'text-[22px] md:text-2xl' : ''}`}>
                    {view === 'main' ? 'Library' : view.charAt(0).toUpperCase() + view.slice(1)}
                </h1>
                {view === 'main' && <button className="text-[#FA2D48] text-[17px] font-normal">Edit</button>}
            </div>

            <div className="px-5 mt-2">
                {renderContent()}
            </div>
        </div>
    );
};