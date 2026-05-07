import './SessionsCard.css';
import { useState, useEffect } from 'react';
import { getSessions } from '../services/session';
import { formatFocusTime } from '../utils/time';

const SessionsCard = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    getSessions()
      .then(data => {
        const completed = data.filter(s => s.status === 'completed');
        setNow(Date.now());
        setSessions(completed.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const timeAgo = (dateStr, nowMs) => {
    const diff = Math.floor((nowMs - new Date(dateStr)) / 1000);
    if (Number.isNaN(diff)) return '-';
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) return <div className="sessions-card">Loading sessions...</div>;

  if (sessions.length === 0) return (
    <div className="sessions-card">
      <div className="sessions-card__title">Recent Sessions</div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', padding: '1rem 0' }}>
        No sessions yet. Complete a focus session to see it here.
      </p>
    </div>
  );

  return (
    <div className="sessions-card">
      <div className="sessions-card__title">Recent Sessions</div>

      <div className="sessions-card__table-header">
        <div className="sessions-card__th">Session</div>
        <div className="sessions-card__th">Duration</div>
        <div className="sessions-card__th">Date</div>
      </div>

      {sessions.map((s, i) => {
        const startedAt = s.started_at ?? s.start_time;
        const targetSeconds = s.target_time_secs ?? s.target_time;

        return (
          <div className="sessions-card__row" key={s.id ?? i}>
            <div>
              <div className="sessions-card__name">{s.room_name ?? 'Focus Session'}</div>
              <div className="sessions-card__sub">{timeAgo(startedAt, now)} - {formatTime(startedAt)}</div>
            </div>
            <div className="sessions-card__cell sessions-card__cell--highlight">
              {formatFocusTime(targetSeconds)}
            </div>
            <div className="sessions-card__cell">{formatDate(startedAt)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionsCard;
