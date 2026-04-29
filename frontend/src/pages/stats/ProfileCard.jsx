import './ProfileCard.css'

const ProfileCard = ({ name, email, joinedDate }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatted = new Date(joinedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="profile-card">
      <div className="profile-card__avatar">{initials}</div>
      <div className="profile-card__info">
        <div className="profile-card__name">{name}</div>
        <div className="profile-card__email">{email}</div>
        <div className="profile-card__joined">Since {formatted}</div>
      </div>
    </div>
  );
};

export default ProfileCard;