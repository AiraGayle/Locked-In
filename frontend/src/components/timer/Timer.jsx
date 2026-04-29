import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDuration } from '../../utils/time.js';
import './Timer.css';

const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const DEFAULT_MINUTES = 25;
const MAX_TIMER_SECONDS = 24 * 60 * 60;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const secondsToDurationFields = (seconds) => {
  const safeSeconds = clamp(Number(seconds) || 0, 0, MAX_TIMER_SECONDS);

  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: Math.floor(safeSeconds % 60),
  };
};

const getDurationFieldValue = (value, max) => {
  return clamp(Number(value) || 0, 0, max);
};

const getDurationTotalSeconds = ({ hours, minutes, seconds }) => {
  const totalSeconds =
    getDurationFieldValue(hours, 24) * 3600 +
    getDurationFieldValue(minutes, 59) * 60 +
    getDurationFieldValue(seconds, 59);

  return clamp(totalSeconds, 1, MAX_TIMER_SECONDS);
};

const Timer = ({
  onStart,
  onPause,
  onResume,
  onComplete,
  onCancel,
  initialTargetSeconds = DEFAULT_MINUTES * 60,
  initialSecondsLeft = DEFAULT_MINUTES * 60,
  initialMode = 'idle',
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialTargetSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [mode, setMode] = useState(initialMode);
  const [editDuration, setEditDuration] = useState(() => secondsToDurationFields(initialTargetSeconds));

  const intervalRef = useRef(null);
  const secondsLeftRef = useRef(initialSecondsLeft);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateSecondsLeft = useCallback((value) => {
    setSecondsLeft((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      secondsLeftRef.current = next;
      return next;
    });
  }, []);

  // Sync external updates safely
  useEffect(() => {
    setTotalSeconds(initialTargetSeconds);
    updateSecondsLeft(initialSecondsLeft);
    setMode(initialMode);
    setEditDuration(secondsToDurationFields(initialTargetSeconds));
  }, [
    initialTargetSeconds,
    initialSecondsLeft,
    initialMode,
    updateSecondsLeft
  ]);

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  const clampedProgress = Math.min(1, Math.max(0, progress));

  const strokeDashoffset =
    CIRCLE_CIRCUMFERENCE * (1 - clampedProgress);

  // Timer loop
  useEffect(() => {
    if (mode !== 'running') return;

    intervalRef.current = setInterval(() => {
      updateSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimerInterval();
          setMode('idle');
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimerInterval;
  }, [mode, onComplete, clearTimerInterval, updateSecondsLeft]);

  const handleStart = async () => {
    const nextSeconds = mode === 'editing'
      ? getDurationTotalSeconds(editDuration)
      : secondsLeft;

    setMode('running');
    setTotalSeconds(nextSeconds);
    updateSecondsLeft(nextSeconds);
    await onStart?.(nextSeconds);
  };

  const handlePause = async () => {
    clearTimerInterval();
    const pausedSeconds = secondsLeftRef.current;

    setMode('paused');
    updateSecondsLeft(pausedSeconds);
    await onPause?.(pausedSeconds);
  };

  const handleResume = async () => {
    setMode('running');
    await onResume?.();
  };

  const handleCancel = async () => {
    clearTimerInterval();
    setMode('idle');
    updateSecondsLeft(totalSeconds);
    await onCancel?.();
  };

  const handleEdit = () => {
    setMode('editing');
  };

  const handleEditCancel = () => {
    setMode('idle');
    setEditDuration(secondsToDurationFields(totalSeconds));
  };

  const handleEditSave = () => {
    const secs = getDurationTotalSeconds(editDuration);

    setTotalSeconds(secs);
    updateSecondsLeft(secs);
    setMode('idle');
  };

  const handleEditChange = (field, value) => {
    setEditDuration((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  return (
    <div className="timer">
      <div className="timer__ring-wrapper">
        <svg className="timer__ring" viewBox="0 0 200 200">
          <circle
            className="timer__ring-track"
            cx="100"
            cy="100"
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="timer__ring-progress"
            cx="100"
            cy="100"
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </svg>

        <span className="timer__display">
          {formatDuration(secondsLeft)}
        </span>
      </div>

      {(mode === 'idle' || mode === 'editing') && (
        <button
          className="timer__edit-btn"
          onClick={mode === 'editing' ? handleEditCancel : handleEdit}
        >
          {mode === 'editing' ? 'Cancel' : 'Edit Timer'}
        </button>
      )}

      {mode === 'editing' && (
        <div className="timer__edit-row">
          <label className="timer__edit-group">
            <input
              type="number"
              className="timer__edit-input"
              value={editDuration.hours}
              min={0}
              max={24}
              onChange={(e) => handleEditChange('hours', e.target.value)}
              onKeyDown={handleEditKeyDown}
              autoFocus
            />
            <span className="timer__edit-label">hours</span>
          </label>

          <label className="timer__edit-group">
            <input
              type="number"
              className="timer__edit-input"
              value={editDuration.minutes}
              min={0}
              max={59}
              onChange={(e) => handleEditChange('minutes', e.target.value)}
              onKeyDown={handleEditKeyDown}
            />
            <span className="timer__edit-label">min</span>
          </label>

          <label className="timer__edit-group">
            <input
              type="number"
              className="timer__edit-input"
              value={editDuration.seconds}
              min={0}
              max={59}
              onChange={(e) => handleEditChange('seconds', e.target.value)}
              onKeyDown={handleEditKeyDown}
            />
            <span className="timer__edit-label">sec</span>
          </label>

          <button className="timer__edit-save" onClick={handleEditSave}>
            Set
          </button>
        </div>
      )}

      <div className="timer__controls">
        {(mode === 'idle' || mode === 'editing') && (
          <button className="timer__btn timer__btn--start" onClick={handleStart}>
            Start
          </button>
        )}

        {mode === 'running' && (
          <button className="timer__btn timer__btn--pause" onClick={handlePause}>
            Pause
          </button>
        )}

        {mode === 'paused' && (
          <>
            <button className="timer__btn timer__btn--cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="timer__btn timer__btn--start" onClick={handleResume}>
              Resume
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
