import Navbar from '../../components/navbar/Navbar';
import StatCard from '../../components/stat-card/StatCard';
import ProfileCard from '../../cards/ProfileCard'
import ChartCard from '../../cards/ChartCard';
import SessionsCard from '../../cards/SessionsCard';
import './stats.css';
import { Timer, Flame, Check } from "lucide-react";
import { formatFocusTime } from '../../utils/time';
import { useState, useEffect } from 'react';
import { getStats } from '../../services/session';

const StatsPage = ( { onNavigate, user }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((data) => {
        setStats(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);
  
  const totalFocusSeconds = Math.floor(Number(stats?.total_focus_time_seconds || 0));

  const STATS = [
    { label: 'Total Focus Time',   value: isLoading ? '—' : formatFocusTime(totalFocusSeconds),    icon: <Timer color='#3b82f6' size={20} /> },
    { label: 'Longest Day Streak', value: isLoading ? '—' : `${stats?.longest_streak ?? 0}`, icon: <Flame color='#a855f7' size={20} /> },
    { label: 'Sessions Completed', value: isLoading ? '—' : `${stats?.sessions_completed ?? 0}`,  icon: <Check color='#22c55e' size={20} /> },
  ];

  return (
    <div className="stats-page">
      <Navbar
        title="My Stats"
        leftButtons={[
          { label: 'Home', onClick: () => onNavigate('/dashboard') },
        ]}
        showStreakPill
        streak={stats?.current_streak ?? 0}
      />

      <main className="stats-main">
          <ProfileCard
            name={user?.username}
            email={user?.email}
            joinedDate={user?.created_at}
          />
          <div className="stats-card-grid">
            {STATS.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
            ))}
          </div>
        <ChartCard daily={stats?.daily || []} />
        <SessionsCard />
      </main>
    </div>
  );
};

export default StatsPage;
