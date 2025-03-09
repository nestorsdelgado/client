import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import AuthModal from './components/AuthModal/AuthModal';
import IsPrivate from './components/IsPrivate/IsPrivate';
import IsAnon from './components/IsAnon/IsAnon';

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
        <Route path="/team" element={<div>Team Component</div>} />
        <Route path="/leaderboard" element={<div>Leaderboard Component</div>} />
        <Route path="/info" element={<div>Info Component</div>} />
        <Route path="/market" element={<div>Market Component</div>} />
        <Route path="/activity" element={<div>Activity Component</div>} />
      </Routes>
    </div>
  );
}

export default App;