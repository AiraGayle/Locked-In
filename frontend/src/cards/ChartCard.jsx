import { useState } from 'react';
import './ChartCard.css';
import { formatFocusTime } from '../utils/time';

const getSessionCount = (day) => Number(day.sessions ?? 0);
const getFocusSeconds = (day) => Math.floor(Number(day.total_seconds ?? 0));
const getDayLabel = (day) => {
  const date = new Date(day.day);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const ChartCard = ({ daily = [] }) => {
  const [activeTab, setActiveTab] = useState('Focus Time');
  const [selectedBar, setSelectedBar] = useState(null);

  const maxSeconds = Math.max(...daily.map(getFocusSeconds), 1);
  const maxSessions = Math.max(...daily.map(getSessionCount), 1);

  const bars = daily.map((d) => {
    const seconds = getFocusSeconds(d);
    const sessions = getSessionCount(d);
    const day = getDayLabel(d);

    return {
      day,
      pct: activeTab === 'Focus Time'
        ? Math.round((seconds / maxSeconds) * 100)
        : Math.round((sessions / maxSessions) * 100),
      isZero: activeTab === 'Focus Time' ? seconds === 0 : sessions === 0,
      time: formatFocusTime(seconds),
      sessions,
    };
  });

  const avgSeconds = daily.length
    ? daily.reduce((sum, d) => sum + getFocusSeconds(d), 0) / daily.length
    : 0;
  const avgSessions = daily.length
    ? daily.reduce((sum, d) => sum + getSessionCount(d), 0) / daily.length
    : 0;
  const dailyAvg = activeTab === 'Focus Time'
    ? formatFocusTime(avgSeconds)
    : `${avgSessions.toFixed(1)} ${avgSessions === 1 ? 'session' : 'sessions'}`;

  if (daily.length === 0) return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <div className="chart-card__label">Daily Average</div>
          <div className="chart-card__avg">-</div>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', padding: '1rem 0' }}>
        No focus time this week yet. Complete sessions to see your chart.
      </p>
    </div>
  );

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <div className="chart-card__label">Daily Average</div>
          <div className="chart-card__avg">{dailyAvg}</div>
        </div>
        <div className="chart-card__toggle">
          {['Focus Time', 'Sessions'].map((key) => (
            <button
              key={key}
              className={`chart-card__toggle-btn ${activeTab === key ? 'chart-card__toggle-btn--active' : ''}`}
              onClick={() => { setActiveTab(key); setSelectedBar(null); }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-card__bars">
        {bars.map((bar) => (
          <div className="chart-card__bar-group" key={bar.day}>
            <div className="chart-card__bar-wrap">
              <div
                className="chart-card__bar-anchor"
                style={{ height: bar.isZero ? '4px' : `${bar.pct}%`, width: '100%', position: 'relative' }}
                onClick={() => setSelectedBar(prev => prev?.day === bar.day ? null : bar)}
              >
                {selectedBar?.day === bar.day && (
                  <div className="chart-card__tooltip">
                    <div><strong>{bar.day}</strong></div>
                    {activeTab === 'Focus Time'
                      ? <div>{bar.time}</div>
                      : <div>{bar.sessions} {bar.sessions === 1 ? 'session' : 'sessions'}</div>
                    }
                  </div>
                )}
                <div className="chart-card__bar" style={{ height: '100%' }} />
              </div>
            </div>
            <div className="chart-card__bar-day">{bar.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCard;
