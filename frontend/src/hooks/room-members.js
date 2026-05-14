import { useState, useEffect } from 'react';
import { on, off } from '../services/ws-client.js';
import { getRoom } from '../services/room.js';

export const useRoomMembers = (userId, roomId, onNavigate, onKicked) => {
  const [members, setMembers] = useState([]);

  // Initial fetch
  useEffect(() => {
    if (!roomId) return;
    getRoom(roomId).then((data) => setMembers(data.members)).catch(console.error);
  }, [roomId]);

  // WebSocket events
  useEffect(() => {
    const handleUserJoin = () => {
      getRoom(roomId).then((data) => setMembers(data.members)).catch(console.error);
    };

    const handleUserLeave = ({ userId }) => {
      setMembers((prev) => prev.filter((m) => String(m.user_id) !== String(userId)));
    };

    const handleUserRemoved = ({ userId: removedId }) => {
      if (String(removedId) === String(userId)) {
        onKicked ? onKicked() : onNavigate('/dashboard');
        return;
      }
      setMembers((prev) => prev.filter((m) => String(m.user_id) !== String(removedId)));
    };

    const handleTimerStart = ({
      userId,
      targetSeconds,
      startedAt,
      originalTargetSeconds,
      remainingSeconds,
    }) => {
      const resolvedTarget =
        Number(targetSeconds) ||
        Number(originalTargetSeconds) ||
        Number(remainingSeconds) ||
        25 * 60;

      setMembers((prev) =>
        prev.map((m) => {
          if (String(m.user_id) !== String(userId)) return m;

          return {
            ...m,
            status: 'active',
            sessionStatus: 'ongoing',
            startedAt,

            targetSeconds: resolvedTarget,
            originalTargetSeconds: resolvedTarget,

            // IMPORTANT: never undefined
            remainingSeconds: resolvedTarget,
          };
        })
      );
    };

    const handleTimerPause = ({ userId, remainingSeconds }) => {
      setMembers((prev) =>
        prev.map((m) =>
          String(m.user_id) === String(userId)
            ? { ...m, status: 'idle', startedAt: null, targetSeconds: remainingSeconds, remainingSeconds, sessionStatus: 'paused', originalTargetSeconds: m.originalTargetSeconds }
            : m
        )
      );
    };

    const handleTimerEnd = ({ userId }) => {
      setMembers((prev) =>
        prev.map((m) =>
          String(m.user_id) === String(userId)
            // Preserve originalTargetSeconds so the display resets to last-set
            // duration, not 25:00. Also clear session_id so useTimerState uses
            // the fallback path and doesn't recompute from the stale DB session.
            ? { ...m, status: 'idle', startedAt: null, session_id: null, targetSeconds: m.originalTargetSeconds, remainingSeconds: null, sessionStatus: null }
            : m
        )
      );
    };

    on('user:join', handleUserJoin);
    on('user:leave', handleUserLeave);
    on('user:removed', handleUserRemoved);
    on('timer:start', handleTimerStart);
    on('timer:pause', handleTimerPause);
    on('timer:complete', handleTimerEnd);
    on('timer:cancel', handleTimerEnd);

    return () => {
      off('user:join', handleUserJoin);
      off('user:leave', handleUserLeave);
      off('user:removed', handleUserRemoved);
      off('timer:start', handleTimerStart);
      off('timer:pause', handleTimerPause);
      off('timer:complete', handleTimerEnd);
      off('timer:cancel', handleTimerEnd);
    };
  }, [userId, onNavigate]);

  // Periodic sync every 6s to catch missed updates
  useEffect(() => {
    if (!roomId) return;

    const syncMembers = async () => {
      try {
        const room = await getRoom(roomId);
        setMembers((prev) => {
          const prevMap = new Map(prev.map((m) => [m.user_id, m]));

          const merge = (oldMember, newMember) => {
            if (!oldMember) return newMember;

            // originalTargetSeconds is client-only — always carry it forward.
            const originalTargetSeconds = oldMember.originalTargetSeconds || newMember.originalTargetSeconds;

            // If local state explicitly cleared session_id (complete/cancel),
            // don't let a stale DB snapshot restore it. The DB catches up within
            // a few seconds and the next sync will reflect reality.
            const session_id = oldMember.session_id === null ? null : (newMember.session_id ?? oldMember.session_id);

            // Paused: keep local timer fields exactly — DB value drifts.
            if (oldMember.sessionStatus === 'paused' && newMember.sessionStatus === 'paused') {
              return {
                ...newMember,
                session_id,
                startedAt: null,
                targetSeconds: oldMember.targetSeconds,
                remainingSeconds: oldMember.remainingSeconds,
                sessionStatus: 'paused',
                originalTargetSeconds,
              };
            }

            // Idle (completed/cancelled): keep local session_id=null.
            if (oldMember.session_id === null) {
              return { ...newMember, session_id: null, targetSeconds: originalTargetSeconds, originalTargetSeconds };
            }

            // Running: trust DB startedAt only if newer than local.
            const useDbTimer = !oldMember.startedAt || !newMember.startedAt || newMember.startedAt >= oldMember.startedAt;
            if (useDbTimer) return { ...newMember, session_id, originalTargetSeconds };

            return {
              ...newMember,
              session_id,
              startedAt: oldMember.startedAt,
              targetSeconds: oldMember.targetSeconds,
              remainingSeconds: oldMember.remainingSeconds,
              sessionStatus: oldMember.sessionStatus,
              originalTargetSeconds,
            };
          };

          const membershipChanged =
            prev.length !== room.members.length ||
            room.members.some((m) => !prevMap.has(m.user_id));

          if (!membershipChanged) {
            return prev.map((old) => merge(old, room.members.find((m) => m.user_id === old.user_id) || old));
          }

          return room.members.map((nm) => merge(prevMap.get(nm.user_id), nm));
        });
      } catch (err) {
        console.debug('[members-sync] error:', err.message);
      }
    };

    const interval = setInterval(syncMembers, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  return { members, setMembers };
};