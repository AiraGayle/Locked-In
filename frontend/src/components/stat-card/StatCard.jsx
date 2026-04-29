import './StatCard.css';

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="stat-card">
      {icon && <div className="stat-card__icon-left">{icon}</div>}

      <div className="stat-card__content">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;