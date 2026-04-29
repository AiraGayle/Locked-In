import './SessionsCard.css';

const SESSIONS = [
  { name: 'Deep Work: Design Sprint', sub: 'Thursday · 9:00 AM',  duration: '2h 10m', date: 'Apr 24' },
  { name: 'Research & Reading',       sub: 'Wednesday · 2:30 PM', duration: '1h 45m', date: 'Apr 23' },
  { name: 'Code Review & Docs',       sub: 'Tuesday · 10:15 AM',  duration: '55m',    date: 'Apr 22' },
  { name: 'Product Planning',         sub: 'Monday · 8:00 AM',    duration: '1h 20m', date: 'Apr 21' },
  { name: 'Morning Review',           sub: 'Sunday · 7:45 AM',    duration: '44m',    date: 'Apr 20' },
];

const SessionsCard = () => {
  return (
    <div className="sessions-card">
      <div className="sessions-card__title">Recent Sessions</div>

      <div className="sessions-card__table-header">
        <div className="sessions-card__th">Session</div>
        <div className="sessions-card__th">Duration</div>
        <div className="sessions-card__th">Date</div>
      </div>

      {SESSIONS.map((s, i) => (
        <div className="sessions-card__row" key={i}>
          <div>
            <div className="sessions-card__name">{s.name}</div>
            <div className="sessions-card__sub">{s.sub}</div>
          </div>
          <div className="sessions-card__cell sessions-card__cell--highlight">
            {s.duration}
          </div>
          <div className="sessions-card__cell">{s.date}</div>
        </div>
      ))}
    </div>
  );
};

export default SessionsCard;