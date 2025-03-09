import axios from 'axios';

// Create an instance of axios
const api = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL
});

// Add a request interceptor
api.interceptors.request.use(
    config => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');

        // If token exists, add it to request headers
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;