import React from 'react';
import { Play, Download, Plus, Clock, Heart } from 'lucide-react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';

export const Library: React.FC = () => {
    const { playSong } = usePlayer();

    const MenuItem = ({ icon: Icon, label, sub }: { icon: any, label: string, sub?: string }) => (
        <div className="flex items-center gap-4 py-3 px-4 active:bg-white/5">
            <Icon className="text-gray-400" size={24} />
            <div className="flex-1">
                <h4 className="text-white font-medium text-base">{label}</h4>
                {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );

    return (
        <div className="pt-16 md:pt-10 pb-32 min-h-screen">
            <div className="px-4 mb-6">
                <h1 className="text-3xl font-bold text-white mb-6">Library</h1>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {['Playlists', 'Songs', 'Albums', 'Artists'].map((tab, i) => (
                        <button key={tab} className={`pb-2 text-sm font-medium ${i === 0 ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                <div className="px-4 py-2 flex items-center gap-2 mb-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#212121] rounded-full text-sm font-medium text-white border border-white/5">
                        <Download size={14} />
                        Downloads
                    </button>
                </div>

                <MenuItem icon={Plus} label="New Playlist" />
                <MenuItem icon={Heart} label="Your Likes" sub="Auto-playlist • 124 songs" />
                <MenuItem icon={Clock} label="Recent Activity" />

                <div className="mt-4 px-4">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recently Added</span>
                        <span className="text-xs text-red-500 font-medium">See All</span>
                    </div>

                    {MOCK_SONGS.map(song => (
                        <div
                            key={song.id}
                            className="flex items-center gap-3 mb-4 cursor-pointer active:opacity-70"
                            onClick={() => playSong(song)}
                        >
                            <img src={song.coverUrl} className="w-12 h-12 rounded object-cover" />
                            <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">{song.title}</h4>
                                <p className="text-gray-400 text-xs">{song.artist}</p>
                            </div>
                            <button className="p-2"><Play size={16} fill="white" className="text-white" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};