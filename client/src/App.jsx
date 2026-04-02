import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/auth/RouteGuards';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import GigDetail from './pages/GigDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import CreateListing from './pages/seller/CreateListing';
import MyListings from './pages/seller/MyListings';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Billing from './pages/Billing';
import PostRequest from './pages/buyer/PostRequest';
import MyRequests from './pages/buyer/MyRequests';
import BrowseRequests from './pages/seller/BrowseRequests';
import Messages from './pages/Messages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Guest-only routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/gigs/:id" element={<GigDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />

              {/* Seller only */}
              <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
                <Route path="/seller/create" element={<CreateListing />} />
                <Route path="/seller/listings" element={<MyListings />} />
              </Route>

              {/* Account Management */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/billing" element={<Billing />} />

              {/* Gig Requests */}
              <Route path="/requests/post" element={<PostRequest />} />
              <Route path="/requests/my" element={<MyRequests />} />
              <Route path="/requests/browse" element={<BrowseRequests />} />

              {/* Messages */}
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
