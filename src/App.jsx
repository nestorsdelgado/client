import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//import MainContent from './components/MainContent/MainContent.jsx'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Router>
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Routes>
      <Route path="/" exact element={<MainContent isOpen={isSidebarOpen} />} />
      </Routes>
      <Sidebar isOpen={isSidebarOpen} />
      {/* <MainContent isSidebarOpen={isSidebarOpen} /> */}
      </Router>
    </div>
  );
}

export default App;