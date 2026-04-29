import Navbar from '../../components/navbar/Navbar';
import StatCard from '../../components/stat-card/StatCard';
import ProfileCard from './ProfileCard';
import ChartCard from './ChartCard';
import SessionsCard from './SessionsCard';
import './stats.css';
import { Timer, Flame, Check } from "lucide-react";

const STATS = [
  { label: 'Total Focus Time',   value: '8h 54m', icon: <Timer color='#3b82f6' size={50} /> },
  { label: 'Longest Day Streak', value: '8',      icon: <Flame color='#a855f7' size={50} /> },
  { label: 'Sessions Completed', value: '9',      icon: <Check color='#22c55e' size={50} />  },
];

const NAV_BUTTONS = [
  { label: 'Home',     active: false },
  { label: 'My Stats', active: true  },
];

const StatsPage = () => {
  return (
    <div className="stats-page">
      <Navbar
        title="My Stats"
        leftButtons={NAV_BUTTONS}
        showStreakPill
        streak={5}
      />

      <main className="stats-main">
          <ProfileCard
            name="Jordan Rivera"
            email="jordan@example.com"
            joinedDate="2023-03-15"
          />
          <div className="stats-card-grid">
            {STATS.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
            ))}
          </div>
        <ChartCard />
        <SessionsCard />
      </main>
    </div>
  );
};

export default StatsPage;