import { BrowserRouter, Routes, Route } from 'react-router';
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

        <Route path="/demo-room" element={<DemoRoomPage />} />

        {/* Catch-all — redirect to login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
