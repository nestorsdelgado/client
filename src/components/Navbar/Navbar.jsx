import React from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <nav className="navbar">
      <button 
        className="navbar-toggle"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>
      
      <img 
        src="/logo.png" 
        alt="LEC Fantasy Logo" 
        className="navbar-logo"
      />
      
      <img 
        src="/user-avatar.png" 
        alt="User" 
        className="navbar-user-avatar"
      />
    </nav>
  );
};

export default Navbar;