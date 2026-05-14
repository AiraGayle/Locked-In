import { useEffect } from 'react';

export const useTimerInterval = ({
  mode,
  totalSeconds,
  startTimeRef,
  intervalRef,
  originalSecondsRef,
  locallyFinishedRef,
  setSecondsLeft,
  setTotalSeconds,
  setMode,
  modeRef,
  clearTimerInterval,
  onComplete,
}) => {
  useEffect(() => {
    if (mode !== 'running') return;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearTimerInterval();
        const orig = originalSecondsRef.current;
        setSecondsLeft(orig);
        setTotalSeconds(orig);
        setMode('idle');
        modeRef.current = 'idle';
        locallyFinishedRef.current = true;
        onComplete?.();
      }
    }, 250);

    return clearTimerInterval;
  }, [
    mode, totalSeconds, startTimeRef, intervalRef, originalSecondsRef,
    locallyFinishedRef, setSecondsLeft, setTotalSeconds, setMode,
    modeRef, clearTimerInterval, onComplete,
  ]);
};