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

function LoadingScreen() {
  return (
    <div >
      <div >
        <span >refresh</span>
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
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

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
                  <Route path="/settings" element={<SettingsPage />} />
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
