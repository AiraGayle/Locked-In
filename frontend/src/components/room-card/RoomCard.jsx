import { memo } from 'react';
import './RoomCard.css';

const StatusDot = memo(({ visible, status }) => {
  if (!visible) return null;

  return (
    <span className={`room-card__dot room-card__dot--${status}`} />
  );
});

StatusDot.displayName = 'StatusDot';

const RoomCard = memo(({ room, onJoin, activeUserTimer }) => {
  const isActive = room.status === 'active';

  const hasPeopleInside = room.has_active_members;

  return (
    <div className="room-card">
      <div className="room-card__top">
        <span className="room-card__name">{room.name}</span>

        {/* Only show green dot if room has active members */}
        <StatusDot
          visible={hasPeopleInside}
          status={room.status}
        />
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
  return (
    prevProps.room === nextProps.room &&
    prevProps.activeUserTimer === nextProps.activeUserTimer
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;