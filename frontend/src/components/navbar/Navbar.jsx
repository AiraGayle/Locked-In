import './Navbar.css';
import { Flame } from "lucide-react";

const Navbar = ({
  title,
  leftButtons = [],
  rightButtons = [],
  showStreakPill = false,
  streak = 0,
}) => {
  const renderButton = (button) => (
    <button
      key={button.label}
      type="button"
      className={`navbar__btn navbar__btn--${button.variant ?? 'secondary'} ${button.active ? 'navbar__btn--active' : ''}`}
      onClick={button.onClick}
    >
      {button.label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar__left">
        {leftButtons.map(renderButton)}
      </div>

      <span className="navbar__title">{title}</span>

      <div className="navbar__right">
        {rightButtons.map(renderButton)}

        {showStreakPill && (
          <div className="navbar__streak-pill">
            <Flame size={20} className="streak-icon" /> 
            <span className="streak-full">
              Current Streak: <strong>{streak} {streak > 1 ? "days" : "day"}</strong>
            </span>
            <span className="streak-short">
              <strong>{streak} {streak > 1 ? "days" : "day"}</strong>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
