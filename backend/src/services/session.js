import { query } from '../db/db.js';

const convertIntervalToSeconds = (interval) => {
  if (!interval) return 0;

  // If it's already a number, return it
  if (typeof interval === 'number') return Math.floor(interval);

  // If it's a string, try to parse PostgreSQL interval format
  if (typeof interval === 'string') {
    // Handle format like "00:25:00" (HH:MM:SS)
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const [, hours, minutes, seconds] = match;
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    }

    // Handle format like "25 minutes" or "1 hour 30 minutes"
    const totalSeconds = interval
      .replace(/hours?/g, '*3600+')
      .replace(/minutes?/g, '*60+')
      .replace(/seconds?/g, '+')
      .replace(/\s+/g, '')
      .split('+')
      .filter(Boolean)
      .reduce((acc, part) => {
        if (part.includes('*')) {
          const [num, mult] = part.split('*');
          return acc + (parseInt(num) * parseInt(mult));
        }
        return acc + parseInt(part);
      }, 0);

    return isNaN(totalSeconds) ? 0 : totalSeconds;
  }

  // For other types, try to convert to number
  const num = parseInt(interval);
  return isNaN(num) ? 0 : num;
};

const formatSessionRow = (row) => ({
  ...row,
  remaining_time_secs: row.remaining_time_secs || (typeof row.remaining_time === 'number' ? row.remaining_time : 0),
  target_time_secs: row.target_time_secs || (typeof row.target_time === 'number' ? row.target_time : 0),
});

const updateMemberStatus = async (sessionId, userId, status) => {
  await query(
    `UPDATE room_members SET status = $1
     WHERE user_id = $2
     AND room_id = (SELECT room_id FROM focus_sessions WHERE id = $3)`,
    [status, userId, sessionId]
  );
};

const logSession = async ({ userId, roomId, targetSeconds }) => {
  const result = await query(
    `INSERT INTO focus_sessions (user_id, room_id, start_time, target_time, remaining_time, status)
     VALUES ($1, $2, NOW(), make_interval(secs := $3), make_interval(secs := $3), 'ongoing')
     RETURNING *, EXTRACT(EPOCH FROM target_time) AS target_time_secs, EXTRACT(EPOCH FROM remaining_time) AS remaining_time_secs`,
    [userId, roomId, targetSeconds]
  );
  await query(
    "UPDATE room_members SET status = 'active' WHERE user_id = $1 AND room_id = $2",
    [userId, roomId]
  );
  return formatSessionRow(result.rows[0]);
};

const pauseSession = async ({ sessionId, userId }) => {
  const result = await query(
    `UPDATE focus_sessions SET status = 'paused', remaining_time = make_interval(secs := EXTRACT(EPOCH FROM (target_time - (NOW() - start_time))))
     WHERE id = $1 AND user_id = $2 AND status = 'ongoing' RETURNING *, EXTRACT(EPOCH FROM target_time) AS target_time_secs, EXTRACT(EPOCH FROM remaining_time) AS remaining_time_secs`,
    [sessionId, userId]
  );
  if (result.rows.length === 0) throw new Error('Session not found or cannot be paused');
  await updateMemberStatus(sessionId, userId, 'idle');
  return formatSessionRow(result.rows[0]);
};

const resumeSession = async ({ sessionId, userId }) => {
  const result = await query(
    `UPDATE focus_sessions SET status = 'ongoing', start_time = NOW(), target_time = remaining_time
     WHERE id = $1 AND user_id = $2 AND status = 'paused' RETURNING *, EXTRACT(EPOCH FROM target_time) AS target_time_secs, EXTRACT(EPOCH FROM remaining_time) AS remaining_time_secs`,
    [sessionId, userId]
  );
  if (result.rows.length === 0) throw new Error('Session not found or cannot be resumed');
  await updateMemberStatus(sessionId, userId, 'active');
  return formatSessionRow(result.rows[0]);
};

const completeSession = async ({ sessionId, userId }) => {
  const result = await query(
    `UPDATE focus_sessions SET status = 'completed', end_time = NOW(), remaining_time = '0'
     WHERE id = $1 AND user_id = $2 AND status IN ('ongoing', 'paused') RETURNING *`,
    [sessionId, userId]
  );
  if (result.rows.length === 0) throw new Error('Session not found or already ended');
  await updateMemberStatus(sessionId, userId, 'idle');
  return formatSessionRow(result.rows[0]);
};

const cancelSession = async ({ sessionId, userId }) => {
  const result = await query(
    `UPDATE focus_sessions SET status = 'cancelled', end_time = NOW()
     WHERE id = $1 AND user_id = $2 AND status IN ('ongoing', 'paused') RETURNING *`,
    [sessionId, userId]
  );
  if (result.rows.length === 0) throw new Error('Session not found or already ended');
  await updateMemberStatus(sessionId, userId, 'idle');
  return formatSessionRow(result.rows[0]);
};

const getSessionHistory = async (userId) => {
  const result = await query(
    `SELECT fs.*, r.name AS room_name FROM focus_sessions fs
     JOIN rooms r ON r.id = fs.room_id
     WHERE fs.user_id = $1 ORDER BY fs.start_time DESC`,
    [userId]
  );
  return result.rows.map(formatSessionRow);
};

const calculateLongestStreak = (days) => {
  if (!days.length) return 0;
  const dates = days.map((d) => new Date(d).toDateString());
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / (1000 * 60 * 60 * 24);
    current = diff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
};

const getSessionStats = async (userId) => {
  const totals = await query(
    `SELECT COUNT(*) FILTER (WHERE status = 'completed') AS sessions_completed,
            COALESCE(SUM(target_time) FILTER (WHERE status = 'completed'), '0') AS total_focus_time
     FROM focus_sessions WHERE user_id = $1`,
    [userId]
  );
  const daily = await query(
    `SELECT DATE(start_time) AS day, COUNT(*) AS sessions, SUM(target_time) AS focus_time
     FROM focus_sessions
     WHERE user_id = $1 AND status = 'completed' AND start_time >= NOW() - INTERVAL '7 days'
     GROUP BY day ORDER BY day`,
    [userId]
  );
  const streakRows = await query(
    `SELECT DISTINCT DATE(start_time) AS day FROM focus_sessions
     WHERE user_id = $1 AND status = 'completed' ORDER BY day ASC`,
    [userId]
  );
  return {
    ...totals.rows[0],
    longest_streak: calculateLongestStreak(streakRows.rows.map((r) => r.day)),
    daily: daily.rows,
  };
};

export { logSession, pauseSession, resumeSession, completeSession, cancelSession, getSessionHistory, getSessionStats };