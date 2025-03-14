import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import AuthModal from './components/AuthModal/AuthModal';
import MarketPage from './components/MarketPage/MarketPage';
import TeamPage from './components/TeamPage/TeamPage';
import InfoPage from './components/InfoPage/InfoPage';
import ActivityPage from './components/ActivityPage/ActivityPage';
import LeaderboardPage from './components/LeaderboardPage/LeaderboardPage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="App">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        openAuthModal={handleOpenAuthModal}
      />

      <Sidebar isOpen={isSidebarOpen} />

      <AuthModal
        open={isAuthModalOpen}
        onClose={handleCloseAuthModal}
      />

      <Routes>
        <Route
          path="/"
          element={
            <MainContent
              isSidebarOpen={isSidebarOpen}
              openAuthModal={handleOpenAuthModal}
            />
          }
        />
        <Route
          path="/team"
          element={
            <TeamPage />
          }
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route
          path="/market"
          element={
            <MarketPage />
          }
        />
        <Route path="/activity" element={<ActivityPage />} />
      </Routes>
    </div>
  );
}

export default App;