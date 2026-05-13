import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_TIMER_SECONDS = 24 * 60 * 60;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseTimerField = (value) => clamp(Number(value) || 0, 0, MAX_TIMER_SECONDS);

const secondsToDurationFields = (seconds) => {
  const safeSeconds = clamp(Number(seconds) || 0, 0, MAX_TIMER_SECONDS);

  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: Math.floor(safeSeconds % 60),
  };
};

const getDurationTotalSeconds = ({ hours, minutes, seconds }) => {
  const totalSeconds =
    parseTimerField(hours) * 3600 +
    parseTimerField(minutes) * 60 +
    parseTimerField(seconds);

  return clamp(totalSeconds || 1, 1, MAX_TIMER_SECONDS);
};

export const useTimer = ({
  initialTargetSeconds,
  initialSecondsLeft,
  initialMode,
  onComplete,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialTargetSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [mode, setMode] = useState(initialMode);
  const [editDuration, setEditDuration] = useState(
    () => secondsToDurationFields(initialTargetSeconds)
  );

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const syncTimerState = useCallback((targetSeconds, remainingSeconds, nextMode) => {
    setTotalSeconds(targetSeconds);
    setSecondsLeft(remainingSeconds);
    setMode(nextMode);
    setEditDuration(secondsToDurationFields(targetSeconds));
    startTimeRef.current = nextMode === 'running'
      ? Date.now() - (targetSeconds - remainingSeconds) * 1000
      : null;
  }, []);

  useEffect(() => {
    syncTimerState(initialTargetSeconds, initialSecondsLeft, initialMode);
  }, [initialTargetSeconds, initialSecondsLeft, initialMode, syncTimerState]);

  useEffect(() => {
    if (mode !== 'running') return undefined;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const nextSecondsLeft = Math.max(0, totalSeconds - elapsedSeconds);

      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft <= 0) {
        clearTimerInterval();
        setMode('idle');
        onComplete?.();
      }
    }, 250);

    return clearTimerInterval;
  }, [mode, totalSeconds, clearTimerInterval, onComplete]);

  const handleStart = useCallback(async () => {
    const nextSeconds = mode === 'editing'
      ? getDurationTotalSeconds(editDuration)
      : secondsLeft;

    setTotalSeconds(nextSeconds);
    setSecondsLeft(nextSeconds);
    setMode('running');
    startTimeRef.current = Date.now();

    return nextSeconds;
  }, [editDuration, mode, secondsLeft]);

  const handlePause = useCallback(async () => {
    clearTimerInterval();
    setMode('paused');
    startTimeRef.current = null;
  }, [clearTimerInterval]);

  const handleResume = useCallback(async () => {
    setMode('running');
    startTimeRef.current = Date.now();
  }, []);

  const handleCancel = useCallback(async () => {
    clearTimerInterval();
    setMode('idle');
    setSecondsLeft(totalSeconds);
    startTimeRef.current = null;
  }, [clearTimerInterval, totalSeconds]);

  const handleEdit = useCallback(() => {
    setMode('editing');
  }, []);

  const handleEditCancel = useCallback(() => {
    setMode('idle');
    setEditDuration(secondsToDurationFields(totalSeconds));
  }, [totalSeconds]);

  const handleEditSave = useCallback(() => {
    const secs = getDurationTotalSeconds(editDuration);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setMode('idle');
    startTimeRef.current = null;
  }, [editDuration]);

  const handleEditChange = useCallback((field, value) => {
    setEditDuration((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  }, [handleEditCancel, handleEditSave]);

  return {
    totalSeconds,
    secondsLeft,
    mode,
    editDuration,
    handleStart,
    handlePause,
    handleResume,
    handleCancel,
    handleEdit,
    handleEditCancel,
    handleEditSave,
    handleEditChange,
    handleEditKeyDown,
    syncTimerState,
  };
};
