import React from 'react';
import { Home, Compass, Library, Search } from 'lucide-react';
import { Tab } from '../types';
import { THEME } from '../constants';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: Tab.HOME, icon: Home, label: 'Home' },
    { id: Tab.EXPLORE, icon: Compass, label: 'Explore' },
    { id: Tab.LIBRARY, icon: Library, label: 'Library' },
  ];

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl h-16 flex items-center justify-around border-t border-white/10 z-40 backdrop-blur-md"
      style={{ backgroundColor: THEME.navBar }}
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1"
          >
            <Icon
              size={24}
              color={isActive ? THEME.text : THEME.textSecondary}
              fill={isActive ? THEME.text : 'none'}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? THEME.text : THEME.textSecondary }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};