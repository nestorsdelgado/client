import axios from 'axios';
import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_SERVER_URL;

class AuthService {
  // Login user
  async login(email, password) {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // Register user
  async register(username, email, password) {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
    });

    return response.data;
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  }

  // Set auth header for axios
  setAuthHeader() {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }
}

<Dialog open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
  {/* Dialog content */}
</Dialog>

export default new AuthService();