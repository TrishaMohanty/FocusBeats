import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { MainLayout } from './MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MusicPage } from '../pages/MusicPage';
import { TimerPage } from '../pages/TimerPage';
import { TasksPage } from '../pages/TasksPage';
import { PlannerPage } from '../pages/PlannerPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin text-primary">
        <span className="material-symbols-outlined text-4xl">refresh</span>
      </div>
    </div>
  );
}

// ProtectedRoute will redirect to login ONLY if the page specifically requires it.
// The new architecture allows Guest access to the dashboard.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Guest Accessible Pages */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/music" element={<MusicPage />} />
                  <Route path="/timer" element={<TimerPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}
