import { BrowserRouter, Routes, Route } from 'react-router';
import { LoginPage } from './components/LoginPage';
import { AuthGuard } from './components/AuthGuard';
import { DashboardLayout } from './components/DashboardLayout';

export default function App() {
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

        {/* Catch-all — redirect to login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
