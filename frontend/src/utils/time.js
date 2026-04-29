const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
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

export { formatDuration, formatDate, formatTime, intervalToSeconds };