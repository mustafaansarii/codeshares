import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/footer/Footer';
import NotFound from './components/not-found/NotFound';
import authService from './services/auth.service';

function App() {
  const location = useLocation();
  const noFooterPaths = ['/login', '/signup'];
  const hideFooter = noFooterPaths.includes(location.pathname);

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
