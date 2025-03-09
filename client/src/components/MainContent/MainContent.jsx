import React, { useState, useEffect } from 'react';
import './MainContent.css';
import Leagues from '../Leagues/Leagues';
import axios from 'axios';
import Button from '@mui/material/Button';
import AddLeague from '../AddLeague/AddLeague';
import JoinLeague from '../JoinLeague/JoinLeague';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Box, Typography, ThemeProvider, createTheme } from '@mui/material';
import { Add, GroupAdd } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_SERVER_URL;

// Custom theme for the pagination (white numbers)
const paginationTheme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: 'white',
          '&.Mui-selected': {
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        icon: {
          color: 'white',
        },
      },
    },
  },
});

const MainContent = ({ isSidebarOpen, openAuthModal }) => {

  const [allLeagues, setAllLeagues] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [leaguesPerPage] = useState(4);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // This useEffect will run when the component mounts and whenever refreshKey changes
  useEffect(() => {
    if (isLoggedIn) {
      console.log("Fetching leagues with refreshKey:", refreshKey);
      fetchLeagues();
    }
  }, [refreshKey, isLoggedIn]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      console.log("Making API request to fetch leagues");

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No authentication token found");
        setAllLeagues([]);
        setLoading(false);
        return;
      }

      // Set up the request headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log("Making request with token:", token.substring(0, 10) + "...");

      const response = await axios.get(`${API_URL}/api/my-leagues`, config);
      console.log("API response:", response.data);

      // Handle different response structures
      let leaguesData = [];

      if (Array.isArray(response.data)) {
        leaguesData = response.data;
      } else if (response.data && Array.isArray(response.data.Ligas)) {
        leaguesData = response.data.Ligas;
      } else if (response.data && typeof response.data === 'object') {
        // If data is an object, try to find an array property
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            leaguesData = response.data[key];
            break;
          }
        }
      }

      console.log("Processed leagues data:", leaguesData);
      setAllLeagues(leaguesData);
    } catch (error) {
      console.error("Error fetching leagues:", error);
      console.error("Error response:", error.response?.data);

      // If unauthorized, we may need to clear token and set logged out
      if (error.response?.status === 401) {
        console.log("Unauthorized: token may be invalid");
        // Optionally clear token if it's invalid
        // localStorage.removeItem('token');
        // setIsLoggedIn(false);
      }

      setAllLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueCreated = () => {
    console.log("League created, refreshing leagues list");
    setIsCreateModalOpen(false);
    // Increment refreshKey to trigger the useEffect and fetch leagues again
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleLeagueJoined = () => {
    console.log("League joined, refreshing leagues list");
    setIsJoinModalOpen(false);
    // Increment refreshKey to trigger the useEffect and fetch leagues again
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Calculate pagination
  const indexOfLastLeague = currentPage * leaguesPerPage;
  const indexOfFirstLeague = indexOfLastLeague - leaguesPerPage;

  // Make sure allLeagues is an array before slicing
  const safeAllLeagues = Array.isArray(allLeagues) ? allLeagues : [];

  // Get current leagues for current page
  const currentLeagues = safeAllLeagues.slice(indexOfFirstLeague, indexOfLastLeague);

  // Calculate total number of pages
  const pageCount = Math.max(1, Math.ceil(safeAllLeagues.length / leaguesPerPage));

  // Change page
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenLogin = () => {
    if (openAuthModal) {
      openAuthModal();
    }
  };

  return (
    <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="league-header">
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          My Leagues
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GroupAdd />}
            onClick={() => isLoggedIn ? setIsJoinModalOpen(true) : handleOpenLogin()}
          >
            Join League
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => isLoggedIn ? setIsCreateModalOpen(true) : handleOpenLogin()}
          >
            Create League
          </Button>
        </Box>
      </div>

      <AddLeague
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeagueAdded={handleLeagueCreated}
      />

      <JoinLeague
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onLeagueJoined={handleLeagueJoined}
      />

      {!isLoggedIn ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 8,
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>
            Please log in to view your leagues
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenLogin}
          >
            Log In
          </Button>
        </Box>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="body1" sx={{ color: 'white' }}>Loading leagues...</Typography>
        </Box>
      ) : (
        <>
          {safeAllLeagues.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 8,
                gap: 2
              }}
            >
              <Typography variant="h6" sx={{ color: 'white' }}>
                You're not a member of any leagues yet.
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                Create a new league or join an existing one.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  Join a League
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create a League
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Leagues leagues={currentLeagues} />

              {/* Only show pagination if we have leagues */}
              {safeAllLeagues.length > leaguesPerPage && (
                <Stack spacing={2} alignItems="center" sx={{ mt: 3, mb: 3 }}>
                  <ThemeProvider theme={paginationTheme}>
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                      size="large"
                    />
                  </ThemeProvider>
                </Stack>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MainContent;