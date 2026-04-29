import { startSession, pauseSession, resumeSession, completeSession, cancelSession } from '../services/session.js';
import { send } from '../services/ws-client.js';

export const useTimerHandlers = (roomId, user, sessionId, setSessionId, setSessionData, setMembers) => {
  const handleTimerStart = async (targetSeconds) => {
    const session = await startSession(roomId, targetSeconds);
    setSessionId(session.id);
    setSessionData(session);
    // Use server start_time so WS and DB always agree on startedAt
    const startedAt = new Date(session.start_time).getTime();
    // Lock in original target — needed for circle progress denominator across pause/resume
    send('timer:start', { userId: user.id, targetSeconds, startedAt, originalTargetSeconds: targetSeconds });
    setMembers((prev) =>
      prev.map((m) => m.user_id === user.id
        ? { ...m, status: 'active', targetSeconds, startedAt, sessionStatus: 'ongoing', remainingSeconds: null, originalTargetSeconds: targetSeconds }
        : m)
    );
  };

  const handleTimerPause = async (clientSecondsLeft) => {
    if (sessionId) {
      const remainingSeconds = clientSecondsLeft;
      send('timer:pause', { userId: user.id, remainingSeconds });
      setMembers((prev) =>
        prev.map((m) => m.user_id === user.id
          ? { ...m, status: 'idle', startedAt: null, targetSeconds: remainingSeconds, remainingSeconds, sessionStatus: 'paused', originalTargetSeconds: m.originalTargetSeconds }
          : m)
      );
      await pauseSession(sessionId);
    }
  };

  const handleTimerResume = async () => {
    if (sessionId) {
      const updated = await resumeSession(sessionId);
      setSessionData(updated);
      const remainingSeconds = updated.remaining_time_secs;
      const startedAt = new Date(updated.start_time).getTime();
      setMembers((prev) =>
        prev.map((m) => {
          if (m.user_id !== user.id) return m;
          const originalTargetSeconds = m.originalTargetSeconds;
          send('timer:start', { userId: user.id, targetSeconds: remainingSeconds, startedAt, originalTargetSeconds });
          return { ...m, status: 'active', targetSeconds: remainingSeconds, startedAt, sessionStatus: 'ongoing', remainingSeconds: null, originalTargetSeconds };
        })
      );
    }
  };

  const handleTimerComplete = async () => {
    if (sessionId) await completeSession(sessionId);
    setSessionId(null);
    setSessionData(null);
    send('timer:complete', { userId: user.id });
    setMembers((prev) =>
      prev.map((m) => m.user_id === user.id
        ? { ...m, status: 'idle', startedAt: null, targetSeconds: null, remainingSeconds: null, sessionStatus: null }
        : m)
    );
  };

  const handleTimerCancel = async () => {
    if (sessionId) await cancelSession(sessionId);
    setSessionId(null);
    setSessionData(null);
    send('timer:cancel', { userId: user.id });
    setMembers((prev) =>
      prev.map((m) => m.user_id === user.id
        ? { ...m, status: 'idle', startedAt: null, targetSeconds: null, remainingSeconds: null, sessionStatus: null }
        : m)
    );
  };

  return { handleTimerStart, handleTimerPause, handleTimerResume, handleTimerComplete, handleTimerCancel };
};