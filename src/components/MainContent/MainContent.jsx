import React, { useState, useEffect } from 'react';
import './MainContent.css';
import Leagues from '../Leagues/Leagues';
import axios from 'axios';
import BasicButtons from '../Button/button';
import AddLeague from '../AddLeague/AddLeague';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const API_URL = process.env.REACT_APP_SERVER_URL;

const MainContent = ({ isSidebarOpen }) => {
  const [allLeagues, setAllLeagues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [leaguesPerPage] = useState(4);

  useEffect(() => {
    fetchLeagues();
  }, [refreshKey]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/my-leagues`);
      console.log("API response:", response.data); // Debug log

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

      console.log("Extracted leagues data:", leaguesData); // Debug log
      setAllLeagues(leaguesData);
    } catch (error) {
      console.error("Error fetching leagues:", error);
      setAllLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueCreated = async () => {
    setIsModalOpen(false);
    await fetchLeagues();
    setRefreshKey((prevKey) => prevKey + 1);
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

  return (
    <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="league-header">
        <BasicButtons
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          label="Crear liga"
        />
      </div>

      <AddLeague
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeagueAdded={handleLeagueCreated}
      />

      {loading ? (
        <p>Loading leagues...</p>
      ) : (
        <>
          <Leagues leagues={currentLeagues} />

          {/* Only show pagination if we have leagues */}
          {safeAllLeagues.length > 0 && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 3, mb: 3 }}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size="large"
                sx={{"& .MuiPaginationItem-root": { color: "white" } }}
              />
            </Stack>
          )}
        </>
      )}
    </div>
  );
};

export default MainContent;