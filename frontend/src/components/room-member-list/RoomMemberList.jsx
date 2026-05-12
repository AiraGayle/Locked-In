import { useState, useEffect } from 'react';
import { formatDuration } from '../../utils/time.js';
import './RoomMemberList.css';

const STATUS_LABELS = { active: 'focusing', idle: 'idle' };

const MemberTimer = ({ startedAt, targetSeconds, remainingSeconds, isPaused }) => {
  const safeNumber = (value) =>
    value != null && !Number.isNaN(Number(value)) ? Number(value) : 0;

  const getPausedValue = () =>
    safeNumber(remainingSeconds != null ? remainingSeconds : targetSeconds);

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (isPaused) return getPausedValue();
    if (!targetSeconds) return 0;
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      return Math.max(0, safeNumber(targetSeconds) - elapsed);
    }
    return 0;
  });

  // Effect 1: update display when paused state changes.
  // Kept separate from the interval effect so syncing remainingSeconds from DB
  // does NOT restart the countdown interval (which caused the "faster" bug).
  useEffect(() => {
    if (isPaused) {
      setSecondsLeft(getPausedValue());
    }
  }, [isPaused, remainingSeconds, targetSeconds]);

  // Effect 2: countdown interval — only depends on startedAt/targetSeconds/isPaused.
  // Removing remainingSeconds from deps means periodic DB syncs that update
  // remainingSeconds won't clear and restart the interval mid-countdown.
  useEffect(() => {
    if (!targetSeconds || isPaused) return;
    if (!startedAt) return;

    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const initial = Math.max(0, Number(targetSeconds) - elapsed);
    setSecondsLeft(initial);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, targetSeconds, isPaused]);

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

const RoomMemberList = ({ members, userId, isHost, onKick, onCloseRoom }) => (
  <div className="member-list">
    <h3 className="member-list__title">
      {members.length} {members.length === 1 ? 'person' : 'people'} in this room
    </h3>
    <div className="member-list__items">
      {members.map((member) => (
        <MemberItem
          key={member.user_id}
          member={member}
          isCurrentUser={String(member.user_id) === String(userId)}
          isHost={isHost}
          onKick={onKick}
        />
      ))}
    </div>
    {isHost && (
      <button className="member-list__close-btn" onClick={onCloseRoom}>
        Close room
      </button>
    )}
  </div>
);

export default RoomMemberList;