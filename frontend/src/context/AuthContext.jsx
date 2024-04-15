/**
 * ==========================================
 * SkillMint Frontend - Authentication Context
 * ==========================================
 * Provides global state management for the authenticated user, session persistence, 
 * axios API interceptors for passing JWT headers, and helpers for signup, login, 
 * Google OAuth2, demo access, and logout.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Base URL configurations matching backend endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = API_URL.replace(/\/api$/, '');

// Create an Axios instance with base URL pre-configured
const API = axios.create({ baseURL: API_URL });
console.log('SkillMint API_URL:', API_URL);

/**
 * Axios Request Interceptor
 * Intercepts all outgoing HTTP requests from this instance.
 * Automatically injects the JWT token (from either sessionStorage for demo profiles or localStorage for standard profiles)
 * into the Authorization header to authenticate requests securely at the backend endpoints.
 */
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sm_demo_token') || localStorage.getItem('sm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// React context used to share auth state globally across components
const AuthContext = createContext(null);

/**
 * AuthProvider Wrapper Component
 * Manages the user profile state, loading states, and exports standard, social, 
 * and presentation login methods alongside system logouts.
 */
export const AuthProvider = ({ children }) => {
  // Global user state (null if unauthenticated)
  const [user, setUser] = useState(null);
  
  // Controls render loading spinner states while checking token validation
  const [loading, setLoading] = useState(true);

  /**
   * Verified Profile Fetcher
   * Requests user data from /api/auth/me to sync frontend states.
   * If token is invalid or has expired, it automatically cleans and flushes browser token storage.
   */
  const fetchMe = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('sm_demo_token') || localStorage.getItem('sm_token');
      if (!token) { setLoading(false); return; }
      
      const { data } = await API.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('sm_token');
      sessionStorage.removeItem('sm_demo_token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync token state on initial application load/mount
  useEffect(() => { fetchMe(); }, [fetchMe]);

  /**
   * Standard Email Login Handler
   * Requests credentials check, persists token in localStorage, and updates global user state.
   */
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('sm_token', data.token);
    setUser(data.user);
    return data.user;
  };

  /**
   * Standard Registration Handler
   * Registers a new account, caches the token, and updates global user state.
   */
  const signup = async (name, email, password, role) => {
    const { data } = await API.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('sm_token', data.token);
    setUser(data.user);
    return data.user;
  };

  /**
   * Google Social Authentication Handler
   * Authenticates user using third-party Google credentials.
   */
  const googleLogin = async (credential) => {
    const { data } = await API.post('/auth/google', { credential });
    localStorage.setItem('sm_token', data.token);
    setUser(data.user);
    return data.user;
  };
  
  /**
   * One-Click Demo Mode Authentication Handler
   * Specifically created for interview processes and high-speed walkthrough runs.
   * Caches token inside temporary sessionStorage so presentation accounts clear when closing tabs.
   * Cleans real session keys to prevent key collisions.
   */
  const demoLogin = async (role) => {
    const { data } = await API.post('/auth/demo', { role });
    // Use sessionStorage for demo — clears when browser/tab is closed
    sessionStorage.setItem('sm_demo_token', data.token);
    localStorage.removeItem('sm_token'); // clear any real session
    setUser(data.user);
    return data.user;
  };

  /**
   * Logout Handler
   * Flushes both persistent and temporary storage keys and sets active user state to null.
   */
  const logout = () => {
    localStorage.removeItem('sm_token');
    sessionStorage.removeItem('sm_demo_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, googleLogin, demoLogin, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom useContext Consumer hook
 * Allows functional components to easily consume shared authentication states and functions.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export { API, SOCKET_URL };
