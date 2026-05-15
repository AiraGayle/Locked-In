import { useState, useEffect } from 'react';
import { formatDuration } from '../../utils/time.js';
import './RoomMemberList.css';

const STATUS_LABELS = { active: 'focusing', idle: 'idle' };

const MemberTimer = ({ startedAt, targetSeconds, remainingSeconds, isPaused }) => {
  const safeNumber = (value) =>
    value != null && !Number.isNaN(Number(value)) ? Number(value) : 0;

  const getBase = () => safeNumber(remainingSeconds != null ? remainingSeconds : targetSeconds);

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (isPaused) return getBase();
    if (!startedAt) return 0;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, getBase() - elapsed);
  });

  useEffect(() => {
    if (isPaused) {
      setSecondsLeft(getBase());
    }
  }, [isPaused, remainingSeconds, targetSeconds]);

  useEffect(() => {
    if (isPaused || !startedAt) return;

    const update = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, getBase() - elapsed));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, remainingSeconds, targetSeconds, isPaused]);

  return <span className="member-timer">{formatDuration(secondsLeft)}</span>;
};

const MemberItem = ({ member, isCurrentUser, isHost, onKick }) => {
  const initials = (member.username || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="member-item">
      <div className="member-avatar">
        {member.avatar_url
          ? <img src={member.avatar_url} alt={member.username} className="member-avatar__img" />
          : initials
        }
      </div>
      <div className="member-info">
        <span className="member-name">
          {member.username || 'Unknown'}{isCurrentUser ? ' (you)' : ''}
        </span>
        <span className={`member-status member-status--${member.status}`}>
          {STATUS_LABELS[member.status] || member.status}
        </span>
      </div>
      {!isCurrentUser && (member.targetSeconds != null || member.remainingSeconds != null) && (
        member.status === 'active' && member.startedAt ? (
          <MemberTimer
            startedAt={member.startedAt}
            targetSeconds={member.targetSeconds}
            remainingSeconds={member.remainingSeconds}
            isPaused={false}
          />
        ) : member.sessionStatus === 'paused' && (member.remainingSeconds != null || member.targetSeconds != null) ? (
          <MemberTimer
            startedAt={null}
            targetSeconds={member.remainingSeconds != null ? member.remainingSeconds : member.targetSeconds}
            remainingSeconds={member.remainingSeconds != null ? member.remainingSeconds : member.targetSeconds}
            isPaused={true}
          />
        ) : null
      )}
      {member.role === 'host' && (
        <span className="member-host-badge">host</span>
      )}
      {/* Kick button — only visible to host, only on non-host members */}
      {isHost && !isCurrentUser && member.role !== 'host' && (
        <button
          className="member-kick-btn"
          onClick={() => onKick(member.user_id)}
          title={`Kick ${member.username}`}
        >
          kick
        </button>
      )}
    </div>
  )
};

const SkeletonMemberItem = () => (
  <div className="member-item member-item--skeleton">
    <div className="skeleton skeleton--avatar" />
    <div className="member-info">
      <div className="skeleton skeleton--name" />
      <div className="skeleton skeleton--status" />
    </div>
  </div>
);

const RoomMemberList = ({ members, userId, isHost, onKick, onCloseRoom, isLoading }) => (
  <div className="member-list">
    <h3 className="member-list__title">
      {isLoading ? <span className="skeleton skeleton--title" /> : `${members.length} ${members.length === 1 ? 'person' : 'people'} in this room`}
    </h3>
    <div className="member-list__items">
      {isLoading
        ? [1, 2, 3].map((i) => <SkeletonMemberItem key={i} />)
        : members.map((member) => (
            <MemberItem
              key={member.user_id}
              member={member}
              isCurrentUser={String(member.user_id) === String(userId)}
              isHost={isHost}
              onKick={onKick}
            />
          ))
      }
    </div>
    {!isLoading && isHost && (
      <button className="member-list__close-btn" onClick={onCloseRoom}>
        Close room
      </button>
    )}
  </div>
);

export default RoomMemberList;