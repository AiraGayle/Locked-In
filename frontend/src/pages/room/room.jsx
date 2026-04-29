import { useState, useEffect, useRef, useCallback } from 'react';
import Timer from '../../components/timer/Timer.jsx';
import RoomMemberList from '../../components/room-member-list/RoomMemberList.jsx';
import { getRoom, leaveRoom } from '../../services/room.js';
import { cancelSession } from '../../services/session.js';
import { connect, disconnect, send } from '../../services/ws-client.js';
import { isOnline, onReconnect, onDisconnect } from '../../utils/sw.js';
import { useRoomMembers } from '../../hooks/room-members.js';
import { useTimerHandlers } from '../../hooks/timer-handler.js';
import { useTimerState } from '../../hooks/timer-state.js';
import './room.css';

const Room = ({ user, roomId, onNavigate }) => {
  const [room, setRoom] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const copyTimeoutRef = useRef(null);
  const { members, setMembers } = useRoomMembers(user.id, roomId, onNavigate);

  const fetchRoom = useCallback(async () => {
    try {
      const data = await getRoom(roomId);
      setRoom(data);
      
      // Restore session state for current user
      const currentUserMember = data.members.find(m => m.user_id === user.id);
      if (currentUserMember && currentUserMember.session_id) {
        setSessionId(currentUserMember.session_id);
        setSessionData({
          id: currentUserMember.session_id,
          remaining_time_secs: currentUserMember.remainingSeconds
        });
        
        // If session is ongoing, calculate startedAt based on remaining time
        if (currentUserMember.sessionStatus === 'ongoing' && currentUserMember.startedAt) {
          const elapsed = Math.floor((Date.now() - currentUserMember.startedAt) / 1000);
          const remaining = Math.max(0, currentUserMember.targetSeconds - elapsed);
          // Update member with current remaining time
          const updatedMember = {
            ...currentUserMember,
            targetSeconds: currentUserMember.targetSeconds,
            startedAt: currentUserMember.startedAt
          };
          setMembers(data.members.map(m => m.user_id === user.id ? updatedMember : m));
        } else {
          setMembers(data.members);
        }
      } else {
        setMembers(data.members);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user.id]);

  useEffect(() => {
    fetchRoom();
    connect(roomId);
    const removeOffline = onDisconnect(() => setIsOffline(true));

    const removeOnline = onReconnect(() => setIsOffline(false));
    return () => {
      disconnect();
      removeOffline();
      removeOnline();
      clearTimeout(copyTimeoutRef.current);
    };
  }, [roomId, fetchRoom]);

  const { handleTimerStart, handleTimerPause, handleTimerResume, handleTimerComplete, handleTimerCancel } = useTimerHandlers(
    roomId, user, sessionId, setSessionId, setSessionData, setMembers
  );

  const handleCopyCode = async () => {
    if (room?.invite_code) {
      await navigator.clipboard.writeText(room.invite_code);
      setShowCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleQuit = async () => {
    if (sessionId) await cancelSession(sessionId);
    await leaveRoom(roomId);
    disconnect();
    onNavigate('/dashboard');
  };

  // Calculate current timer state
  const timerState = useTimerState(members, user);

  if (isLoading) {
    return <div className="room room--state"><p>Loading room...</p></div>;
  }

  if (error) {
    return (
      <div className="room room--state">
        <p>{error}</p>
        <button onClick={() => onNavigate('/dashboard')}>Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="room">
      {isOffline && (
        <div className="room__offline-banner">
          You're offline — timer is still running
        </div>
      )}

      <header className="room__header">
        <button className="room__back-btn" onClick={() => onNavigate('/dashboard')}>
          Back
        </button>
        <div className="room__header-center">
          <h2 className="room__title">{room?.name}</h2>
          <button className="room__invite-code" onClick={handleCopyCode}>
            #{room?.invite_code}
            {showCopied && <span className="room__invite-copied">copied!</span>}
          </button>
        </div>
      </header>

      <main className="room__main">
        <section className="room__timer-section">
          <Timer
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onResume={handleTimerResume}
            onComplete={handleTimerComplete}
            onCancel={handleTimerCancel}
            initialTargetSeconds={timerState.targetSeconds}
            initialSecondsLeft={timerState.secondsLeft}
            initialIsRunning={timerState.isRunning}
            initialHasStarted={timerState.hasStarted}
          />
          <button className="room__quit-btn" onClick={handleQuit}>
            Quit room
          </button>
        </section>

        <aside className="room__sidebar">
          <RoomMemberList members={members} userId={user.id} />
        </aside>
      </main>
    </div>
  );
};

export default Room;