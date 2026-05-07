import './ProfileCard.css'
import { formatDate } from '../utils/time';

const ProfileCard = ({ name, email, joinedDate }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="profile-card">
      <div className="profile-card__avatar">{initials}</div>
      <div className="profile-card__info">
        <div className="profile-card__name">{name}</div>
        <div className="profile-card__email">{email}</div>
        <div className="profile-card__joined">Since {formatDate(joinedDate)}</div>
      </div>
    </div>
  );
};

export default ProfileCard;