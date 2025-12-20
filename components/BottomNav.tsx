
import React from 'react';
import { House, LayoutGrid, Radio, SquareLibrary, Search } from 'lucide-react';
import { Tab } from '../types';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: Tab.HOME, icon: House, label: 'Home' },
    { id: Tab.RADIO, icon: Radio, label: 'Radio' },
    { id: Tab.LIBRARY, icon: SquareLibrary, label: 'Library' },
    { id: Tab.SEARCH, icon: Search, label: 'Search' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 w-full pb-safe-bottom pb-4 pt-3 flex items-center justify-around border-t border-white/10 z-[70] backdrop-blur-3xl bg-[#000000]/95 transition-all duration-300"
      style={{ 
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        touchAction: 'manipulation' 
      }}
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center min-w-[60px] min-h-[56px] space-y-1 active:scale-95 transition-transform touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Icon
              size={24}
              color={isActive ? '#FA2D48' : '#9ca3af'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? '#FA2D48' : '#9ca3af' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};