// import { useState, useEffect } from 'react';
// import LoginPage from './pages/login/login.jsx';
import DashboardPage from './pages/dashboard/dashboard.jsx';
// import RoomPage from './pages/room/room.jsx';
// import StatsPage from './pages/stats/stats.jsx';

const getPath = () => window.location.pathname;

const App = () => {
  const [path, setPath] = useState(getPath());
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  if (path === '/dashboard') {
    return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
};

export { navigate };
export default App;