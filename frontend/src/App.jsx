import { useState, useEffect } from 'react';
import { getMe, logout as authLogout } from './services/auth.js';
import Login from './pages/auth/login.jsx';
import Dashboard from './pages/dashboard/dashboard.jsx';
import Room from './pages/room/room.jsx';
import Stats from './pages/stats/stats.jsx';
import ResetPassword from './pages/auth/reset-pass.jsx';

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
      if (!token) { setIsLoadingUser(false); return; }
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
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await authLogout();   
    setUser(null);
    navigate('/');
  };

  const handleUserUpdate = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    sessionStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  if (path === '/forgot-password') {
    return <ResetPassword onNavigate={navigate} />;
  }

  if (isLoadingUser && path === '/dashboard') {
    return (
      <Dashboard
        user={user || { username: '' }}
        onLogout={handleLogout}
        onNavigate={navigate}
        isLoadingUser
      />
    );
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-12 w-64 bg-zinc-800 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-zinc-900 rounded-3xl p-8 space-y-6">
              <div className="h-24 w-24 rounded-full bg-zinc-800 mx-auto" />
              <div className="h-16 w-48 bg-zinc-800 rounded-xl mx-auto" />
              <div className="flex justify-center gap-4">
                <div className="h-12 w-24 bg-zinc-800 rounded-xl" />
                <div className="h-12 w-24 bg-zinc-800 rounded-xl" />
                <div className="h-12 w-24 bg-zinc-800 rounded-xl" />
              </div>
            </div>
            <div className="bg-zinc-900 rounded-3xl p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-3 w-20 bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (path === '/dashboard') {
    return <Dashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  if (path.startsWith('/room/')) {
    const roomId = path.split('/')[2];
    return <Room user={user} roomId={roomId} onLogout={handleLogout} onNavigate={navigate} />;
  }

  if (path === '/stats') {
    return <Stats user={user} onLogout={handleLogout} onNavigate={navigate} onUserUpdate={handleUserUpdate} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
};

export default App;