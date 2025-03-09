import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

const handleOpenAuthModal = () => {
  setIsAuthModalOpen(true);
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Router>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
        />
        <Routes>
          <Route path="/" exact element={<MainContent isSidebarOpen={isSidebarOpen} openAuthModal={handleOpenAuthModal}/>}/>
        </Routes>
        <Sidebar isOpen={isSidebarOpen} />
        {/* <MainContent isSidebarOpen={isSidebarOpen} /> */}
      </Router>
    </div>
  );
}

export default App;