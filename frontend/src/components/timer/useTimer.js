import { useCallback, useEffect, useRef, useState } from 'react';
import { secondsToDurationFields, durationFieldsToSeconds } from '../../utils/time.js';
import { useTimerEdit } from './useTimerEdit.js';
import { useTimerInterval } from './useTimerInterval.js';

const DEFAULT = 25 * 60;

export const useTimer = ({ initialTargetSeconds, initialSecondsLeft, initialOriginalSeconds, initialMode, onComplete, roomId, user }) => {
  const [totalSeconds, setTotalSeconds] = useState(initialTargetSeconds || DEFAULT);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft  || DEFAULT);
  const [mode, setMode] = useState(initialMode || 'idle');
  const [editDuration, setEditDuration] = useState(() => secondsToDurationFields(initialTargetSeconds || DEFAULT));

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const originalSecondsRef = useRef(initialOriginalSeconds || initialTargetSeconds || DEFAULT);
  const modeRef = useRef(initialMode || 'idle');
  const locallyFinishedRef = useRef(false);

  const clearTimerInterval = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    const midSession = modeRef.current === 'running' || modeRef.current === 'paused';
    if (midSession) return;

    const justFinished = locallyFinishedRef.current;

    // While locally finished, block stale 'running' props (members hasn't
    // caught up yet). Let 'idle' props through to sync the mode, but don't
    // let them overwrite the timer values — originalSecondsRef.current is
    // already correct from handleStart and must not be clobbered by props
    // that may have lost originalTargetSeconds via a DB fetch.
    if (justFinished && initialMode === 'running') return;

    setMode(initialMode || 'idle');
    modeRef.current = initialMode || 'idle';

    if (!justFinished) {
      // Normal sync: trust props fully.
      setTotalSeconds(initialTargetSeconds || DEFAULT);
      setSecondsLeft(Math.max(0, initialSecondsLeft ?? initialTargetSeconds ?? DEFAULT));
      originalSecondsRef.current = initialOriginalSeconds || initialTargetSeconds || DEFAULT;
      startTimeRef.current = initialMode === 'running'
        ? Date.now() - ((initialTargetSeconds || DEFAULT) - (initialSecondsLeft || 0)) * 1000
        : null;
    }
    // justFinished: mode syncs to idle but timer values stay from completion.
    // editDuration reflects the original duration so the user sees it in edit mode.
    setEditDuration(secondsToDurationFields(
      justFinished ? originalSecondsRef.current : (initialTargetSeconds || DEFAULT)
    ));
  }, [initialTargetSeconds, initialSecondsLeft, initialOriginalSeconds, initialMode]);

  useTimerInterval({
    mode, totalSeconds, startTimeRef, intervalRef, originalSecondsRef,
    locallyFinishedRef, setSecondsLeft, setTotalSeconds, setMode,
    modeRef, clearTimerInterval, onComplete,
  });

  const handleStart = useCallback(async () => {
    const nextSeconds = mode === 'editing' ? durationFieldsToSeconds(editDuration) : secondsLeft;
    originalSecondsRef.current = nextSeconds;
    locallyFinishedRef.current = false; // new session clears the finished flag
    setTotalSeconds(nextSeconds);
    setSecondsLeft(nextSeconds);
    setMode('running');
    modeRef.current = 'running';
    startTimeRef.current = Date.now();
    return nextSeconds;
  }, [editDuration, mode, secondsLeft]);

  const handlePause = useCallback(async () => {
    const precise = startTimeRef.current != null
      ? Math.max(0, totalSeconds - Math.floor((Date.now() - startTimeRef.current) / 1000))
      : secondsLeft;
    clearTimerInterval();
    setSecondsLeft(precise);
    setMode('paused');
    modeRef.current = 'paused';
    startTimeRef.current = null;
    return precise;
  }, [clearTimerInterval, totalSeconds, secondsLeft]);

  const handleResume = useCallback(async (serverStartedAt) => {
    setMode('running');
    modeRef.current = 'running';
    const elapsedAtPause = totalSeconds - secondsLeft;
    startTimeRef.current = (serverStartedAt || Date.now()) - elapsedAtPause * 1000;
  }, [totalSeconds, secondsLeft]);

  const handleCancel = useCallback(async () => {
    clearTimerInterval();
    const orig = originalSecondsRef.current;
    setSecondsLeft(orig);
    setTotalSeconds(orig);
    setMode('idle');
    modeRef.current = 'idle';
    startTimeRef.current = null;
  }, [clearTimerInterval]);

  const editHandlers = useTimerEdit({
    totalSeconds, editDuration, setEditDuration,
    setTotalSeconds, setSecondsLeft, setMode, modeRef, originalSecondsRef,
    roomId, user
  });

  const progress = originalSecondsRef.current > 0 ? secondsLeft / originalSecondsRef.current : 0;

  return {
    totalSeconds, secondsLeft, progress, mode, editDuration,
    handleStart, handlePause, handleResume, handleCancel,
    ...editHandlers,
  };
};