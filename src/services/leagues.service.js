import axios from 'axios';

class LeagueService {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:5005"
        });

        // Automatically set JWT token in the headers for every request
        /* this.api.interceptors.request.use((config) => {
            // Retrieve the JWT token from the local storage
            const storedToken = localStorage.getItem("authToken");

            if (storedToken) {
                config.headers = { Authorization: `Bearer ${storedToken}` };
            }

            return config;
        }); */
    }

    // POST /api/my-leagues
    createLeague = async (leagueData) => {
        try {
          const response = await this.api.post('/api/my-leagues', leagueData);
          return response.data;
        } catch (error) {
          console.error("Error creating league:", error);
          throw error;
        }
      };

    // GET /api/my-leagues
    getAllLeagues = async () => {
        try {
            const response = await this.api.get('/api/my-leagues');
            return response.data;
        } catch (error) {
            console.error("Error fetching leagues:", error);
            throw error;
        }
    };

}

const leagueService = new LeagueService();

export default leagueService;