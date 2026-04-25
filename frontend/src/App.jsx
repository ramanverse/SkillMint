/**
 * ==========================================
 * SkillMint Frontend - Main Application Router
 * ==========================================
 * This file orchestrates the client-side routing hierarchy:
 * 1. Global state injection via <AuthProvider>.
 * 2. Page transition scroll resets via <ScrollToTop>.
 * 3. Segmented Route Protections via <GuestRoute> and <ProtectedRoute>.
 * 4. Structured nested application layout wraps via <AppLayout>.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/auth/RouteGuards';
import AppLayout from './components/layout/AppLayout';

// Core Public Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// General Application Pages
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import GigDetail from './pages/GigDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

// Freelancer/Seller Specific Pages
import CreateListing from './pages/seller/CreateListing';
import MyListings from './pages/seller/MyListings';

// User Account Configurations
import Settings from './pages/Settings';
import Support from './pages/Support';
import Billing from './pages/Billing';

// Custom Client Gig Requests
import PostRequest from './pages/buyer/PostRequest';
import MyRequests from './pages/buyer/MyRequests';
import BrowseRequests from './pages/seller/BrowseRequests';

// Direct Messaging & Order Chat Center
import Messages from './pages/Messages';

/**
 * ScrollToTop Page Reset Helper
 * Listens for react-router path changes and automatically resets the browser window 
 * scroll coordinates to (0,0) (top-left) to simulate native page refresh scroll behaviors.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Main App Entry Component
 * Defines the core visual router, binding contexts and nested routes.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Reset page scroll offset on every route change */}
        <ScrollToTop />
        <Routes>
          
          {/* Public Entrance Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Guest-only routes: Prevents logged-in users from returning to login/register paths */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected app routes: Require valid JWT auth states */}
          <Route element={<ProtectedRoute />}>
            
            {/* Standard Dashboard Layout Wrapper (includes Sidebar, Header, and Page layout systems) */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/gigs/:id" element={<GigDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />

              {/* Role Restricted: Freelancer/Seller specific action panels */}
              <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
                <Route path="/seller/create" element={<CreateListing />} />
                <Route path="/seller/listings" element={<MyListings />} />
              </Route>

              {/* Personal Settings and Utility Configurations */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/billing" element={<Billing />} />

              {/* Custom Gig Sourcing Boards (Post Requests & Browse requests boards) */}
              <Route path="/requests/post" element={<PostRequest />} />
              <Route path="/requests/my" element={<MyRequests />} />
              <Route path="/requests/browse" element={<BrowseRequests />} />

              {/* Multi-conversation Chat room portal */}
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>

          {/* Wildcard Fallback redirection to home screen */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
