import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from '../pages/AuthPage';
import { MainLayout } from './MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MusicPage } from '../pages/MusicPage';
import { TimerPage } from '../pages/TimerPage';
import { TasksPage } from '../pages/TasksPage';
import { PlannerPage } from '../pages/PlannerPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { HomePage } from '../pages/HomePage';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-rounded animate-spin text-primary text-4xl">refresh</span>
      </div>
    </div>
  );
}


export function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="music" element={<MusicPage />} />
                  <Route path="timer" element={<TimerPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
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
