
import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { YouTubePlayer } from './components/YouTubePlayer';

import { ListenNow } from './pages/ListenNow';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Explore } from './pages/Explore';
import { Tab } from './types';

import { Sidebar } from './components/Sidebar';
import { DesktopPlayer } from './components/DesktopPlayer';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [previousTab, setPreviousTab] = useState<Tab>(Tab.HOME);

  // Custom navigation handler to support "Back" from Search
  const handleTabChange = (tab: Tab) => {
    if (tab === Tab.SEARCH) {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  const handleBackFromSearch = () => {
    setActiveTab(previousTab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case Tab.HOME:
        return <ListenNow />;
      case Tab.NEW:
        return <Home onSearchPress={() => handleTabChange(Tab.SEARCH)} />;
      case Tab.RADIO:
        return <Explore />; // Using Explore as placeholder for Radio/Other
      case Tab.LIBRARY:
        return <Library />;
      case Tab.SEARCH:
        return <Search onBack={handleBackFromSearch} />;
      default:
        return <ListenNow />;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden relative selection:bg-red-500 selection:text-white flex">
      {/* Audio Engine moved to FullPlayer */}

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block">
        <Sidebar currentTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto no-scrollbar bg-[#121212] md:ml-64 relative overscroll-none">
        <div className="max-w-screen-2xl mx-auto min-h-full pb-36 md:pb-28">
          {renderScreen()}
        </div>
      </main>

      {/* Overlays */}
      <FullPlayer />

      {/* Desktop Player - Hidden on Mobile */}
      <div className="hidden md:block">
        <DesktopPlayer />
      </div>

      {/* Mobile Interface - Hidden on Desktop */}
      <div className="md:hidden">
        <MiniPlayer />
        <BottomNav currentTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
