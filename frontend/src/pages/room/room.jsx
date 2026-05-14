import { useState, useEffect, useRef, useCallback } from 'react';
import Timer from '../../components/timer/Timer.jsx';
import RoomMemberList from '../../components/room-member-list/RoomMemberList.jsx';
import RoomAlerts from '../../modals/RoomAlerts.jsx';
import { getRoom, leaveRoom, closeRoom, removeMember } from '../../services/room.js';
import { cancelSession } from '../../services/session.js';
import { connect, disconnect, send, on, off } from '../../services/ws-client.js';
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
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [showRoomClosedModal, setShowRoomClosedModal] = useState(false);
  const copyTimeoutRef = useRef(null);

  const { members, setMembers } = useRoomMembers(
    user.id, roomId, onNavigate, () => setShowKickedModal(true)
  );

  const fetchRoom = useCallback(async () => {
    try {
      const data = await getRoom(roomId);
      setRoom(data);
      setMembers(data.members);
      const mine = data.members.find((m) => String(m.user_id) === String(user.id));
      if (mine?.session_id) {
        setSessionId(mine.session_id);
        setSessionData({ id: mine.session_id, remaining_time_secs: mine.remainingSeconds });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user.id, setMembers]);

  useEffect(() => {
    fetchRoom();
    connect(roomId);

    const handleRoomKick = ({ targetUserId }) => {
      if (String(targetUserId) === String(user.id)) setShowKickedModal(true);
    };

    const handleRoomClose = () => {
      setShowRoomClosedModal(true);
    };

    on('room:kick', handleRoomKick);
    on('room:close', handleRoomClose);

    const removeOffline = onDisconnect(() => setIsOffline(true));
    const removeOnline = onReconnect(() => setIsOffline(false));

    return () => {
      off('room:kick', handleRoomKick);
      off('room:close', handleRoomClose);
      // Do NOT disconnect here. For intentional quit, handleQuit already called
      // disconnect() (code 1000) before navigating, so the socket is already null.
      // For back-button navigation, we intentionally leave the socket open so the
      // server never sets room_members.status = 'left' and the room stays visible
      // on the dashboard. connect() will close this stale socket (code 4000) the
      // next time the user enters a room.
      removeOffline();
      removeOnline();
      clearTimeout(copyTimeoutRef.current);
    };
  }, [roomId, fetchRoom, user.id]);

  const { handleTimerStart, handleTimerPause, handleTimerResume, handleTimerComplete, handleTimerCancel } =
    useTimerHandlers(roomId, user, sessionId, setSessionId, setSessionData, members, setMembers);

  const handleCopyCode = async () => {
    if (!room?.invite_code) return;
    await navigator.clipboard.writeText(room.invite_code);
    setShowCopied(true);
    clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setShowCopied(false), 2000);
  };

  const handleQuit = async () => {
    if (sessionId) await cancelSession(sessionId);
    await leaveRoom(roomId);
    disconnect();
    onNavigate('/dashboard');
  };

  const handleAlertClose = () => {
    setShowKickedModal(false);
    setShowRoomClosedModal(false);
    onNavigate('/dashboard');
  };


  const isHost = members.find((m) => String(m.user_id) === String(user.id))?.role === 'host';

  const handleKickMember = async (targetUserId) => {
    try {
      await removeMember(roomId, targetUserId);
      send('room:kick', { targetUserId });
    } catch (err) {
      console.error('Failed to kick member:', err.message);
    }
  };

  const handleCloseRoom = async () => {
    try {
      if (sessionId) await cancelSession(sessionId);
      await closeRoom(roomId);
      send('room:close', {});
      disconnect();
      setShowRoomClosedModal(true);
    } catch (err) {
      console.error('Failed to close room:', err.message);
    }
  };

  const isMembersLoaded = members !== undefined && members !== null;

  const timerState = useTimerState(
    members,
    user,
    roomId,
    isMembersLoaded
  );

  if (error) return (
    <div className="room room--state">
      <p>{error}</p>
      <button onClick={() => onNavigate('/dashboard')}>Back to dashboard</button>
    </div>
  );

  return (
    <div className="room">
      {isOffline && <div className="room__offline-banner">You're offline — timer is still running</div>}

      <header className="room__header">
        <button className="room__back-btn" onClick={() => onNavigate('/dashboard')}>
          Back
        </button>
        <div className="room__header-center">
          <h2 className="room__title">
            {isLoading ? <span className="skeleton skeleton--room-title" /> : room?.name}
          </h2>
          <button className="room__invite-code" onClick={handleCopyCode} disabled={isLoading}>
            {isLoading ? <span className="skeleton skeleton--invite-code" /> : `#${room?.invite_code}`}
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
            initialOriginalSeconds={timerState.originalTargetSeconds}
            initialMode={timerState.mode}
            roomId={roomId}
            user={user}
          />
          <button className="room__quit-btn" onClick={handleQuit}>Leave room</button>
        </section>

        <aside className="room__sidebar">
          <RoomMemberList
            members={members}
            userId={user.id}
            isHost={isHost}
            onKick={handleKickMember}
            onCloseRoom={handleCloseRoom}
            isLoading={isLoading}
          />
        </aside>
      </main>

      {showKickedModal && <RoomAlerts type="kicked" onClose={handleAlertClose} />}
      {showRoomClosedModal && <RoomAlerts type="closed" onClose={handleAlertClose} />}
    </div>
  );
};

export default Room;