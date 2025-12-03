
import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { YouTubePlayer } from './components/YouTubePlayer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Tab } from './types';

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
        return <Home onSearchPress={() => handleTabChange(Tab.SEARCH)} />;
      case Tab.EXPLORE:
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                <div className="text-center">
                    <h2 className="text-white text-xl font-bold mb-2">Explore</h2>
                    <p>Coming soon...</p>
                </div>
            </div>
        );
      case Tab.LIBRARY:
        return <Library />;
      case Tab.SEARCH:
        return <Search onBack={handleBackFromSearch} />;
      default:
        return <Home onSearchPress={() => handleTabChange(Tab.SEARCH)} />;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden relative selection:bg-red-500 selection:text-white">
      {/* Audio Engine */}
      <YouTubePlayer />

      {/* Main Content Area */}
      <main className="h-full overflow-y-auto no-scrollbar bg-[#121212]">
        {renderScreen()}
      </main>

      {/* Overlays */}
      <FullPlayer />
      
      {/* Bottom Interface */}
      {activeTab !== Tab.SEARCH && (
        <>
          <MiniPlayer />
          <BottomNav currentTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
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
