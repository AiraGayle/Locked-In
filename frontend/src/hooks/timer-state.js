import { useMemo } from 'react';

export const useTimerState = (members, user) => {
  return useMemo(() => {
    const currentUserMember = members.find(m => m.user_id === user.id);
    if (!currentUserMember || !currentUserMember.session_id) {
      return { targetSeconds: 25 * 60, secondsLeft: 25 * 60, mode: 'idle', originalTargetSeconds: 25 * 60 };
    }

    const targetSeconds = Number(currentUserMember.targetSeconds) || 25 * 60;
    // originalTargetSeconds is tracked in member state across pause/resume cycles.
    // Falls back to targetSeconds on fresh session start (before first pause).
    const originalTargetSeconds = Number(currentUserMember.originalTargetSeconds) || targetSeconds;
    const isOngoing = currentUserMember.sessionStatus === 'ongoing';
    const isPaused = currentUserMember.sessionStatus === 'paused';

    if (isOngoing && currentUserMember.startedAt) {
      const elapsed = Math.floor((Date.now() - currentUserMember.startedAt) / 1000);
      const remaining = Math.max(0, targetSeconds - elapsed);
      return { targetSeconds, secondsLeft: remaining, mode: 'running', originalTargetSeconds };
    }

    if (isPaused) {
      const remaining = Number(currentUserMember.remainingSeconds) || targetSeconds;
      return { targetSeconds, secondsLeft: remaining, mode: 'paused', originalTargetSeconds };
    }

    return { targetSeconds, secondsLeft: targetSeconds, mode: 'idle', originalTargetSeconds };
  }, [members, user.id]);
};
