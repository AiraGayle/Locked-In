import { memo } from 'react';
import './RoomCard.css';

const StatusDot = memo(({ status }) => (
  <span className={`room-card__dot room-card__dot--${status}`} />
));

StatusDot.displayName = 'StatusDot';

const RoomCard = memo(({ room, onJoin, activeUserTimer }) => {
  const isActive = room.status === 'active';

  return (
    <div className="room-card">
      <div className="room-card__top">
        <span className="room-card__name">{room.name}</span>
        <StatusDot status={room.status} />
      </div>
      <p className="room-card__code">#{room.invite_code}</p>
      <div className="room-card__footer">
        <button
          className="room-card__join-btn"
          onClick={() => onJoin(room)}
          disabled={!isActive}
        >
          Join
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if room or activeUserTimer changed
  return (
    prevProps.room === nextProps.room &&
    prevProps.activeUserTimer === nextProps.activeUserTimer
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;