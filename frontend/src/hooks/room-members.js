import { useState, useEffect } from 'react';
import { on, off } from '../services/ws-client.js';
import { getRoom } from '../services/room.js';

export const useRoomMembers = (userId, roomId, onNavigate, onKicked) => {
  const [members, setMembers] = useState([]);

  // Initial fetch — populate members on mount
  useEffect(() => {
    if (!roomId) return;
    getRoom(roomId).then((data) => setMembers(data.members)).catch(console.error);
  }, [roomId]);

  // Handle real-time WebSocket events
  useEffect(() => {
    const handleUserJoin = ({ userId, username }) => {
      setMembers((prev) => {
        if (prev.some((m) => String(m.user_id) === String(userId))) return prev;
        return [...prev, { user_id: userId, username, status: 'idle', role: 'member' }];
      });
    };

    const handleUserLeave = ({ userId }) => {
      setMembers((prev) => prev.filter((m) => String(m.user_id) !== String(userId)));
    };

    const handleUserRemoved = ({ userId: removedId }) => {
      if (String(removedId) === String(userId)) {
        // Let room.jsx show the kicked modal first before navigating
        onKicked ? onKicked() : onNavigate('/dashboard');
        return;
      }
      setMembers((prev) => prev.filter((m) => String(m.user_id) !== String(removedId)));
    };

    const handleTimerStart = ({ userId, targetSeconds, startedAt, originalTargetSeconds }) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (String(m.user_id) === String(userId)) {
            // Preserve originalTargetSeconds: use what WS sent, or fall back to existing, or use targetSeconds as last resort
            const origTarget = originalTargetSeconds || m.originalTargetSeconds || Number(targetSeconds);
            return { ...m, status: 'active', targetSeconds: Number(targetSeconds), startedAt, sessionStatus: 'ongoing', remainingSeconds: null, originalTargetSeconds: origTarget };
          }
          return m;
        })
      );
    };

    const handleTimerEnd = ({ userId }) => {
      setMembers((prev) =>
        prev.map((m) =>
          String(m.user_id) === String(userId)
            ? { ...m, status: 'idle', startedAt: null, targetSeconds: null, remainingSeconds: null, sessionStatus: null, originalTargetSeconds: null }
            : m
        )
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

  // Periodic sync: refresh member data every 6 seconds to catch any missed updates
  useEffect(() => {
    if (!roomId) return;

    const syncMembers = async () => {
      try {
        const room = await getRoom(roomId);
        setMembers((prev) => {
          const prevMap = new Map(prev.map((m) => [m.user_id, m]));
          const newMap = new Map(room.members.map((m) => [m.user_id, m]));

          // Check for membership changes (joins/leaves)
          const membershipChanged =
            prev.length !== room.members.length ||
            room.members.some((m) => !prevMap.has(m.user_id));

          if (!membershipChanged) {
            // No membership changes — merge timer state carefully.
            // Trust the DB only if its startedAt is newer (or we have no local value),
            // to avoid overwriting fresh WS updates with a stale HTTP snapshot.
            return prev.map((oldMember) => {
              const newMember = newMap.get(oldMember.user_id);
              if (!newMember) return oldMember;

              const dbStartedAt = newMember.startedAt;
              const localStartedAt = oldMember.startedAt;

              // If DB startedAt matches or is more recent than what we have, use DB data fully
              const useDbTimer =
                !localStartedAt ||
                !dbStartedAt ||
                dbStartedAt >= localStartedAt;

              if (useDbTimer) {
                return newMember;
              }

              // Local WS data is more recent — keep local timer fields, update everything else
              return {
                ...newMember,
                startedAt: oldMember.startedAt,
                targetSeconds: oldMember.targetSeconds,
                remainingSeconds: oldMember.remainingSeconds,
                sessionStatus: oldMember.sessionStatus,
              };
            });
          }

          // Membership changed — merge each member
          return room.members.map((newMember) => {
            const oldMember = prevMap.get(newMember.user_id);
            if (!oldMember) return newMember;

            const dbStartedAt = newMember.startedAt;
            const localStartedAt = oldMember.startedAt;
            const useDbTimer =
              !localStartedAt ||
              !dbStartedAt ||
              dbStartedAt >= localStartedAt;

            if (useDbTimer) return newMember;

            return {
              ...newMember,
              startedAt: oldMember.startedAt,
              targetSeconds: oldMember.targetSeconds,
              remainingSeconds: oldMember.remainingSeconds,
              sessionStatus: oldMember.sessionStatus,
            };
          });
        });
      } catch (err) {
        console.debug('[members-sync] Error fetching room:', err.message);
      }
    };

    const interval = setInterval(syncMembers, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  return { members, setMembers };
};