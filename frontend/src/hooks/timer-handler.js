import { startSession, pauseSession, resumeSession, completeSession, cancelSession } from '../services/session.js';
import { send } from '../services/ws-client.js';
import { useRef } from 'react';

export const useTimerHandlers = (roomId, user, sessionId, setSessionId, setSessionData, members, setMembers) => {
  const isCompletingRef = useRef(false);

  const handleTimerStart = async (targetSeconds) => {
    const startedAt = Date.now();

    const session = await startSession(roomId, targetSeconds);
    setSessionId(session.id);
    setSessionData(session);

    send('timer:start', {
      userId: user.id,
      targetSeconds,
      startedAt,
      originalTargetSeconds: targetSeconds,
      remainingSeconds: targetSeconds, 
    });

    setMembers((prev) =>
      prev.map((m) =>
        String(m.user_id) === String(user.id)
          ? {
              ...m,
              status: 'active',
              targetSeconds,
              startedAt,
              sessionStatus: 'ongoing',

              originalTargetSeconds: targetSeconds,

              remainingSeconds: null,
            }
          : m
      )
    );
  };

  const handleTimerPause = async (clientSecondsLeft) => {
    if (!sessionId) return;

    const remainingSeconds = clientSecondsLeft;

    send('timer:pause', {
      userId: user.id,
      remainingSeconds,
    });

    setMembers((prev) =>
      prev.map((m) =>
        String(m.user_id) === String(user.id)
          ? {
              ...m,
              status: 'idle',
              startedAt: null,

              sessionStatus: 'paused',

              // KEEP BASE DURATION SAFE
              targetSeconds: m.originalTargetSeconds,

              remainingSeconds,
              originalTargetSeconds: m.originalTargetSeconds,
            }
          : m
      )
    );

    await pauseSession(sessionId);
  };

  const handleTimerResume = async () => {
    if (!sessionId) return;

    const startedAt = Date.now();
    const updated = await resumeSession(sessionId);

    setSessionData(updated);

    const remainingSeconds = updated.remaining_time_secs;

    const mine = members.find(
      (m) => String(m.user_id) === String(user.id)
    );

    const originalTargetSeconds = mine?.originalTargetSeconds;

    setMembers((prev) =>
      prev.map((m) =>
        String(m.user_id) === String(user.id)
          ? {
              ...m,
              status: 'active',
              targetSeconds: originalTargetSeconds,
              startedAt,
              sessionStatus: 'ongoing',

              originalTargetSeconds,

              remainingSeconds: null,
            }
          : m
      )
    );

    send('timer:start', {
      userId: user.id,
      targetSeconds: remainingSeconds,
      startedAt,
      originalTargetSeconds,
      remainingSeconds,
    });

    return startedAt;
  };

  const handleTimerComplete = async () => {
    if (!sessionId || isCompletingRef.current) return;
    isCompletingRef.current = true;
    try {
      await completeSession(sessionId);
    } catch (err) {
      console.error('Complete failed:', err);
    } finally {
      isCompletingRef.current = false;
    }
    setSessionId(null);
    setSessionData(null);
    send('timer:complete', { userId: user.id });
    setMembers((prev) =>
      prev.map((m) => {
        if (String(m.user_id) !== String(user.id)) return m;
        // Preserve originalTargetSeconds so the timer resets to the last-set
        // duration (not 25:00) after the session completes.
        return { ...m, status: 'idle', startedAt: null, session_id: null, targetSeconds: m.originalTargetSeconds, remainingSeconds: null, sessionStatus: null };
      })
    );
  };

  const handleTimerCancel = async () => {
    if (sessionId) await cancelSession(sessionId);
    setSessionId(null);
    setSessionData(null);
    send('timer:cancel', { userId: user.id });
    setMembers((prev) =>
      prev.map((m) => String(m.user_id) === String(user.id)
        ? { ...m, status: 'idle', startedAt: null, session_id: null, targetSeconds: m.originalTargetSeconds, remainingSeconds: null, sessionStatus: null }
        : m)
    );
  };

  return { handleTimerStart, handleTimerPause, handleTimerResume, handleTimerComplete, handleTimerCancel };
};
