import './Navbar.css';
import { Flame } from "lucide-react";

const Navbar = ({ title, showStreakPill = false, streak = 0}) => {
  return (
    <nav className="navbar">
      <div className="navbar__left">
        <button className="navbar__home-btn" onClick={console.log("Go back to dashboard")}>
          Home
        </button>
      </div>

      <span className="navbar__title">{title}</span>

      <div className="navbar__right">
        {showStreakPill && (
          <div className="navbar__streak-pill">
            <Flame size={30} className="streak-icon" /> 
            <span className="streak-full">
              Current Streak: <strong>{streak} days</strong>
            </span>
            <span className="streak-short">
              <strong>{streak} days</strong>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;