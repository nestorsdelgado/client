import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';
import { AccountCircle } from '@mui/icons-material';
import {
  Menu as Dropdown,
  MenuItem,
  IconButton,
  Typography
} from '@mui/material';

const Navbar = ({ isSidebarOpen, toggleSidebar, isAuthModalOpen, setIsAuthModalOpen }) => {

  const [anchorEl, setAnchorEl] = useState(null);  // Controls dropdown state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state for demonstration

  // Get logged in status from localStorage
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
      } catch (e) {
        // Invalid user data in localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    handleCloseMenu();
  };

  const handleOpenAuth = () => {
    handleCloseMenu();
    setIsAuthModalOpen(true);
  };

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

      {/* User Avatar with Dropdown */}
      <IconButton
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleOpenMenu}
        sx={{ color: 'white' }}
      >
        <AccountCircle sx={{ fontSize: 40 }} />
      </IconButton>

      {/* Dropdown Menu - FIXED VERSION */}
      <Dropdown
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {isLoggedIn ? (
          [  // Use an array instead of Fragment
            <MenuItem key="user-info" disabled>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Hello, User
              </Typography>
            </MenuItem>,
            <MenuItem key="logout" onClick={handleLogout}>Log Out</MenuItem>
          ]
        ) : (
          <MenuItem onClick={handleOpenAuth}>Log In / Sign Up</MenuItem>
        )}
      </Dropdown>
    </nav>
  );
};

export default Navbar;