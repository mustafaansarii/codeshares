import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemEditorPage from './pages/ProblemEditorPage';
import PrivateRoute from './components/route-manage/PrivateRoute';
import Footer from './components/footer/Footer';
import NotFound from './components/not-found/NotFound';
import authService from './services/auth.service';

function App() {
  const location = useLocation();
  const noFooterPaths = ['/login', '/profile', '/problems'];
  const isEditorPage = location.pathname.match(/^\/problems\/\d+$/);
  const hideFooter = noFooterPaths.includes(location.pathname) || isEditorPage;

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authService.verifyAuth().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) return null;

  return (
    <div className="min-h-screen text-black dark:text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={authService.isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route
          path="/problems/:id"
          element={
            <PrivateRoute>
              <ProblemEditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems/:id/collab/:sessionId"
          element={
            <PrivateRoute>
              <ProblemEditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
