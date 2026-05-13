const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatTimerDuration = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString || isNaN(new Date(dateString))) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const intervalToSeconds = (interval) => {
  if (!interval) return 0;
  const match = interval.match(/(?:(\d+):)?(\d+):(\d+)/);
  if (!match) return 0;
  const [, hrs = 0, mins, secs] = match;
  return Number(hrs) * 3600 + Number(mins) * 60 + Number(secs);
};

const formatFocusTime = (seconds) => {
  const s = Math.floor(Number(seconds || 0));
  const hours = Math.floor(s / 3600);
  const mins  = Math.floor((s % 3600) / 60);
  const secs  = s % 60;

  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins  > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export { formatDuration, formatTimerDuration, formatDate, formatTime, intervalToSeconds, formatFocusTime };
