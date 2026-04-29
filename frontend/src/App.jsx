import { useState } from 'react';
import DashboardPage from './pages/dashboard/dashboard.jsx';
// import LoginPage from './pages/login/login.jsx';
// import RoomPage from './pages/room/room.jsx';
// import StatsPage from './pages/stats/stats.jsx';

const getPath = () => window.location.pathname;

const App = () => {
  const [path, setPath] = useState(getPath());
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  if (path === '/dashboard') {
    return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
};

export default App;