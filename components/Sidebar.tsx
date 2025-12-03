import React from 'react';
import { Home, Compass, Library, Search, PlusSquare, Heart } from 'lucide-react';
import { Tab } from '../types';

interface Props {
    currentTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const Sidebar: React.FC<Props> = ({ currentTab, onTabChange }) => {
    const navItems = [
        { id: Tab.HOME, icon: Home, label: 'Home' },
        { id: Tab.EXPLORE, icon: Compass, label: 'Explore' },
        { id: Tab.LIBRARY, icon: Library, label: 'Library' },
        { id: Tab.SEARCH, icon: Search, label: 'Search' },
    ];

    return (
        <div className="w-64 bg-black h-screen fixed left-0 top-0 border-r border-white/10 flex flex-col p-6 z-40">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                    V
                </div>
                <span className="text-xl font-bold tracking-tight">Vibe Vibe</span>
            </div>

            {/* Main Nav */}
            <div className="space-y-2 mb-8">
                {navItems.map((item) => {
                    const isActive = currentTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? 'bg-red-500/10 text-red-500 font-medium'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'text-red-500' : 'group-hover:text-white'} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Library Section */}
            <div className="mt-auto">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 px-4">Your Library</h3>
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                    <PlusSquare size={22} />
                    <span>Create Playlist</span>
                </button>
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                    <Heart size={22} />
                    <span>Liked Songs</span>
                </button>
            </div>
        </div>
    );
};
