import { useCallback } from 'react';
import { secondsToDurationFields, durationFieldsToSeconds } from '../../utils/time.js';

export const useTimerEdit = ({
  totalSeconds,
  editDuration,
  setEditDuration,
  setTotalSeconds,
  setSecondsLeft,
  setMode,
  modeRef,
  originalSecondsRef,
	roomId,
	user
}) => {
  const handleEdit = useCallback(() => {
    setMode('editing');
    modeRef.current = 'editing';
  }, [setMode, modeRef]);

  const handleEditCancel = useCallback(() => {
    setMode('idle');
    modeRef.current = 'idle';
    setEditDuration(secondsToDurationFields(totalSeconds));
  }, [totalSeconds, setMode, modeRef, setEditDuration]);

	const handleEditSave = useCallback(() => {
	const nextSeconds =
			durationFieldsToSeconds(editDuration);

	// SAVE USER PREFERENCE
	localStorage.setItem(
			`timer-duration-${roomId}-${user.id}`,
			String(nextSeconds)
	);

	originalSecondsRef.current = nextSeconds;

	setTotalSeconds(nextSeconds);
	setSecondsLeft(nextSeconds);

	setMode('idle');
	modeRef.current = 'idle';
	}, [
	editDuration,
	originalSecondsRef,
	setTotalSeconds,
	setSecondsLeft,
	setMode,
	modeRef,
	roomId,
	user.id,
	]);

  const handleEditChange = useCallback((field, value) => {
    setEditDuration((prev) => ({ ...prev, [field]: value }));
  }, [setEditDuration]);

  const handleEditKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  }, [handleEditSave, handleEditCancel]);

  return { handleEdit, handleEditCancel, handleEditSave, handleEditChange, handleEditKeyDown };
};