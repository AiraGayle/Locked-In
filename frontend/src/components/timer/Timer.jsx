import { useState, useEffect, useRef } from 'react';
import { formatDuration } from '../../utils/time.js';
import './Timer.css';

const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const DEFAULT_MINUTES = 25;

const Timer = ({
  onStart,
  onPause,
  onResume,
  onComplete,
  onCancel,
  initialTargetSeconds = DEFAULT_MINUTES * 60,
  initialSecondsLeft = DEFAULT_MINUTES * 60,
  initialIsRunning = false,
  initialHasStarted = false,
}) => {
  
  const [totalSeconds, setTotalSeconds] = useState(initialTargetSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [hasStarted, setHasStarted] = useState(initialHasStarted);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(initialTargetSeconds / 60));

  const intervalRef = useRef(null);

  // Sync external updates safely
  useEffect(() => {
    setTotalSeconds(initialTargetSeconds);
    setSecondsLeft(initialSecondsLeft);
    setIsRunning(initialIsRunning);
    setHasStarted(initialHasStarted);
    setEditMinutes(Math.floor(initialTargetSeconds / 60));
  }, [
    initialTargetSeconds,
    initialSecondsLeft,
    initialIsRunning,
    initialHasStarted
  ]);

  const elapsed = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

const clampedProgress = Math.min(1, Math.max(0, progress));

const strokeDashoffset =
  CIRCLE_CIRCUMFERENCE * (1 - clampedProgress);

  // Timer loop
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setHasStarted(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onComplete]);

  const handleStart = async () => {
    setIsRunning(true);
    setHasStarted(true);
    setTotalSeconds(secondsLeft);
    await onStart?.(secondsLeft);
  };

  const handlePause = async () => {
    setIsRunning(false);
    await onPause?.(secondsLeft);
  };

  const handleResume = async () => {
    setIsRunning(true);
    await onResume?.();
  };

  const handleCancel = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setHasStarted(false);
    setSecondsLeft(totalSeconds);
    await onCancel?.();
  };

  const handleEditSave = () => {
    const mins = Math.max(1, Math.min(180, Number(editMinutes)));
    const secs = mins * 60;

    setTotalSeconds(secs);
    setSecondsLeft(secs);

    setIsEditingTime(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') setIsEditingTime(false);
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

      {!hasStarted && (
        <button
          className="timer__edit-btn"
          onClick={() => setIsEditingTime(true)}
        >
          Edit timer
        </button>
      )}

      {isEditingTime && (
        <div className="timer__edit-row">
          <input
            type="number"
            className="timer__edit-input"
            value={editMinutes}
            min={1}
            max={180}
            onChange={(e) => setEditMinutes(e.target.value)}
            onKeyDown={handleEditKeyDown}
            autoFocus
          />
          <span className="timer__edit-label">minutes</span>
          <button className="timer__edit-save" onClick={handleEditSave}>
            Set
          </button>
        </div>
      )}

      <div className="timer__controls">
        {!hasStarted ? (
          <button className="timer__btn timer__btn--start" onClick={handleStart}>
            Start
          </button>
        ) : isRunning ? (
          <button className="timer__btn timer__btn--pause" onClick={handlePause}>
            Pause
          </button>
        ) : (
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