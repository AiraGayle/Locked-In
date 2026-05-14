import { useMemo } from 'react';

export const useTimerState = (
  members,
  user,
  roomId,
  isMembersLoaded = true
) => {
  return useMemo(() => {
    const storageKey = `timer-duration-${roomId}-${user.id}`;

    // READ ONLY
    const savedDuration = Number(
      localStorage.getItem(storageKey)
    );

    const fallbackDuration =
      savedDuration > 0 ? savedDuration : 25 * 60;

    // IMPORTANT:
    // avoid overwriting localStorage while loading
    if (!isMembersLoaded) {
      return {
        targetSeconds: fallbackDuration,
        secondsLeft: fallbackDuration,
        mode: 'loading',
        originalTargetSeconds: fallbackDuration,
      };
    }

    const currentUserMember = members.find(
      (m) => String(m.user_id) === String(user.id)
    );
    
    // NO ACTIVE SESSION
    if (!currentUserMember || !currentUserMember.session_id) {
      return {
        targetSeconds: fallbackDuration,
        secondsLeft: fallbackDuration,
        mode: 'idle',
        originalTargetSeconds: fallbackDuration,
      };
    }

    const targetSeconds =
      Number(currentUserMember.targetSeconds) ||
      fallbackDuration;

    const originalTargetSeconds =
      Number(currentUserMember.originalTargetSeconds) ||
      targetSeconds;

    // SAVE ONLY VALID CUSTOM VALUE
    if (originalTargetSeconds > 0) {
      localStorage.setItem(
        storageKey,
        String(originalTargetSeconds)
      );
    }

    const isOngoing =
      currentUserMember.sessionStatus === 'ongoing';

    const isPaused =
      currentUserMember.sessionStatus === 'paused';

    if (isOngoing && currentUserMember.startedAt) {
      const startedAt =
        typeof currentUserMember.startedAt === 'string'
          ? new Date(currentUserMember.startedAt).getTime()
          : Number(currentUserMember.startedAt);

      const elapsed = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      const remaining = Math.max(
        0,
        targetSeconds - elapsed
      );

      return {
        targetSeconds,
        secondsLeft: remaining,
        mode: 'running',
        originalTargetSeconds,
      };
    }

    if (isPaused) {
      const remaining =
        Number(currentUserMember.remainingSeconds) ||
        targetSeconds;

      return {
        targetSeconds,
        secondsLeft: remaining,
        mode: 'paused',
        originalTargetSeconds,
      };
    }

    return {
      targetSeconds,
      secondsLeft: targetSeconds,
      mode: 'idle',
      originalTargetSeconds,
    };
  }, [members, user.id, roomId, isMembersLoaded]);
};