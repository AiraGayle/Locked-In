import { useState, useEffect } from 'react';
import { getMe } from './services/auth.js';
import LoginPage from './pages/login/login.jsx';
import DashboardPage from './pages/dashboard/dashboard.jsx';
import RoomPage from './pages/room/room.jsx';
import StatsPage from './pages/stats/stats.jsx';
import ResetPassword from './pages/login/resetPass.jsx';

const getPath = () => window.location.pathname;

export const navigate = (to) => {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const App = () => {
  const [path, setPath] = useState(getPath());
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setIsLoadingUser(false);
        return;
      }

      try {
        const currentUser = await getMe();
        sessionStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (err) {
        console.warn('Auth verification failed:', err);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (path === '/forgot-password') {
    return <ResetPassword />;
  }

  if (isLoadingUser && path === '/dashboard') {
    return (
      <DashboardPage
        user={user || { username: '' }}
        onLogout={handleLogout}
        onNavigate={navigate}
        isLoadingUser
      />
    );
  }

  if (isLoadingUser) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (path === '/dashboard') {
    return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  if (path.startsWith('/room/')) {
    const roomId = path.split('/')[2];

    return (
      <RoomPage
        user={user}
        roomId={roomId}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  const handleUserUpdate = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  if (path === '/stats') {
    return <StatsPage user={user} onLogout={handleLogout} onNavigate={navigate} onUserUpdate={handleUserUpdate} />;
  }

  // Default: redirect logged-in users to dashboard
  return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
};

export default App; 