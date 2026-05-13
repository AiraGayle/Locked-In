import { useCallback } from 'react';
import { formatTimerDuration } from '../../utils/time.js';
import { useTimer } from './useTimer.js';
import './Timer.css';

const DEFAULT_MINUTES = 25;

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
  const {
    totalSeconds,
    secondsLeft,
    mode,
    editDuration,
    handleEdit,
    handleEditCancel,
    handleEditSave,
    handleEditChange,
    handleEditKeyDown,
    handlePause: pauseTimer,
    handleResume: resumeTimer,
    handleCancel: cancelTimer,
    handleStart: startTimer,
  } = useTimer({
    initialTargetSeconds,
    initialSecondsLeft,
    initialMode,
    onComplete,
  });

  const handleStart = useCallback(async () => {
    const nextSeconds = await startTimer();
    await onStart?.(nextSeconds);
  }, [onStart, startTimer]);

  const handlePause = useCallback(async () => {
    await pauseTimer();
    await onPause?.(secondsLeft);
  }, [onPause, pauseTimer, secondsLeft]);

  const handleResume = useCallback(async () => {
    await resumeTimer();
    await onResume?.();
  }, [onResume, resumeTimer]);

  const handleCancel = useCallback(async () => {
    await cancelTimer();
    await onCancel?.();
  }, [cancelTimer, onCancel]);

  return (
    <div className="timer">
      <div className="timer__ring-wrapper">
        <svg className="timer__ring" viewBox="0 0 200 200">
          <circle
            className="timer__ring-track"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="timer__ring-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - (totalSeconds > 0 ? secondsLeft / totalSeconds : 0))}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </svg>

        <span className="timer__display">
          {formatTimerDuration(secondsLeft)}
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
