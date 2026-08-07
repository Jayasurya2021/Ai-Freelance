import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AISettings from './pages/AISettings';
import URLAnalyzer from './pages/URLAnalyzer';
import SourceManager from './pages/SourceManager';
import MonitoringDashboard from './pages/MonitoringDashboard';
import JobFeed from './pages/JobFeed';
import Watchlist from './pages/Watchlist';
import JobTracker from './pages/JobTracker';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-dummy.apps.googleusercontent.com';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileProvider>
            <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="saved" element={<Saved />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-settings" element={<AISettings />} />
              <Route path="url-analyzer" element={<URLAnalyzer />} />
              <Route path="sources" element={<SourceManager />} />
              <Route path="monitoring" element={<MonitoringDashboard />} />
              <Route path="feed" element={<JobFeed />} />
              <Route path="job-tracker" element={<JobTracker />} />
              <Route path="watchlist" element={<Watchlist />} />
            </Route>
            </Routes>
          </BrowserRouter>
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
