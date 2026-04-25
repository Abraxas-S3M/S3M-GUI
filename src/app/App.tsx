import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AuthGuard } from './components/AuthGuard';
import { DashboardLayout } from './components/DashboardLayout';
import { DemoRoomPage } from './components/DemoRoomPage';
import { initializeRealtimeSync, teardownRealtimeSync } from '../services/realtimeSync';

export default function App() {
  useEffect(() => {
    initializeRealtimeSync();
    return () => teardownRealtimeSync();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login route — the public entry point */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard route — protected behind auth */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        />

        <Route
          path="/demo-room"
          element={
            <AuthGuard>
              <DemoRoomPage />
            </AuthGuard>
          }
        />

        {/* Catch-all — redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
