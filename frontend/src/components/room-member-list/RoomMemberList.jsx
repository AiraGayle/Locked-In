import { useState, useEffect } from 'react';
import { formatDuration } from '../../utils/time.js';
import './RoomMemberList.css';

const STATUS_LABELS = { active: 'focusing', idle: 'idle' };

const MemberTimer = ({ startedAt, targetSeconds, remainingSeconds, isPaused }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!targetSeconds) return 0;
    if (isPaused) return remainingSeconds ? parseInt(remainingSeconds) : 0;
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      return Math.max(0, Number(targetSeconds) - elapsed);
    }
    return 0;
  });

  // Effect 1: update display when paused state changes.
  // Kept separate from the interval effect so syncing remainingSeconds from DB
  // does NOT restart the countdown interval (which caused the "faster" bug).
  useEffect(() => {
    if (isPaused) {
      setSecondsLeft(remainingSeconds ? parseInt(remainingSeconds) : 0);
    }
  }, [isPaused, remainingSeconds]);

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

const MemberItem = ({ member, isCurrentUser }) => (
  <div className="member-item">
    <div className="member-avatar">
      {(member.username || 'U').charAt(0).toUpperCase()}
    </div>
    <div className="member-info">
      <span className="member-name">
        {member.username || 'Unknown'}{isCurrentUser ? ' (you)' : ''}
      </span>
      <span className={`member-status member-status--${member.status}`}>
        {STATUS_LABELS[member.status] || member.status}
      </span>
    </div>
    {!isCurrentUser && member.targetSeconds && (
      member.status === 'active' && member.startedAt ? (
        <MemberTimer
          startedAt={member.startedAt}
          targetSeconds={member.targetSeconds}
          remainingSeconds={member.remainingSeconds}
          isPaused={false}
        />
      ) : member.status === 'idle' && member.remainingSeconds ? (
        <MemberTimer
          startedAt={null}
          targetSeconds={member.remainingSeconds}
          remainingSeconds={member.remainingSeconds}
          isPaused={true}
        />
      ) : null
    )}
    {member.role === 'host' && (
      <span className="member-host-badge">host</span>
    )}
  </div>
);

const RoomMemberList = ({ members, userId }) => (
  <div className="member-list">
    <h3 className="member-list__title">
      {members.length} {members.length === 1 ? 'person' : 'people'} in this room
    </h3>
    <div className="member-list__items">
      {members.map((member) => (
        <MemberItem
          key={member.user_id}
          member={member}
          isCurrentUser={member.user_id === userId}
        />
      ))}
    </div>
  </div>
);

export default RoomMemberList;