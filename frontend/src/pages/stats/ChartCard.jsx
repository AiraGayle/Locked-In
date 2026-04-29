import { useState } from 'react';
import './ChartCard.css';

const CHART_DATA = {
  'Focus Time': [
    { day: 'Sun', pct: 30, time: '1h 20m'},
    { day: 'Mon', pct: 55, time: '2h 10m'},
    { day: 'Tue', pct: 20, time: '45m'},
    { day: 'Wed', pct: 75, time: '3h 00m'},
    { day: 'Thu', pct: 100, time: '4h 10m', active: true},
    { day: 'Fri', pct: 45, time: '1h 50m'},
    { day: 'Sat', pct: 38, time: '1h 30m'},
  ],
  'Sessions': [
    { day: 'Sun', pct: 20, sessions: 1 },
    { day: 'Mon', pct: 40, sessions: 2 },
    { day: 'Tue', pct: 60, sessions: 3 },
    { day: 'Wed', pct: 30, sessions: 2 },
    { day: 'Thu', pct: 90, sessions: 5, active: true },
    { day: 'Fri', pct: 55, sessions: 3 },
    { day: 'Sat', pct: 25, sessions: 1 },
  ],
};

const DAILY_AVG = {
  'Focus Time': '3h 23m',
  Sessions: '1.3',
};

const ChartCard = () => {
  const [activeTab, setActiveTab] = useState('Focus Time');
  const [selectedBar, setSelectedBar] = useState(null);
  const bars = CHART_DATA[activeTab];

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <div className="chart-card__label">Daily Average</div>
          <div className="chart-card__avg">{DAILY_AVG[activeTab]}</div>
        </div>
        <div className="chart-card__toggle">
          {Object.keys(CHART_DATA).map((key) => (
            <button
              key={key}
              className={`chart-card__toggle-btn ${activeTab === key ? 'chart-card__toggle-btn--active' : ''}`}
              onClick={() => setActiveTab(key)}
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
            style={{ height: `${bar.pct}%`, width: '100%', position: 'relative' }}
            onClick={() => setSelectedBar(prev => prev?.day === bar.day ? null : bar)}
          >
            {selectedBar?.day === bar.day && (
              <div className="chart-card__tooltip">
                <div><strong>{bar.day}</strong></div>
                {bar.time && <div>{bar.time}</div>}
                {bar.sessions && <div>{bar.sessions} {bar.sessions === 1 ? 'session' : 'sessions'} </div>}
                <div>{bar.pct}%</div>
              </div>
            )}
            <div
              className={`chart-card__bar ${bar.active ? 'chart-card__bar--active' : ''}`}
              style={{ height: '100%' }}
            />
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