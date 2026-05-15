import { query } from '../config/db.js';

const completed_session_status = 'completed';

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
    `SELECT fs.*, r.name AS room_name,
            EXTRACT(EPOCH FROM fs.target_time) AS target_time_secs,
            EXTRACT(EPOCH FROM fs.remaining_time) AS remaining_time_secs
     FROM focus_sessions fs
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

const calculateCurrentStreak = (days) => {
  if (!days.length) return 0;

  const dates = days.map((d) => new Date(d).toDateString()).reverse(); // most recent first

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const mostRecent = new Date(dates[0]);
  if (mostRecent < yesterday) return 0; // streak is broken

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

const getSessionStats = async (userId) => {
  const totals = await query(
    `SELECT COUNT(*) AS sessions_completed,
            EXTRACT(EPOCH FROM COALESCE(SUM(target_time), INTERVAL '0 seconds')) AS total_focus_time_seconds
     FROM focus_sessions
     WHERE user_id = $1 AND status = $2`,
    [userId, completed_session_status]
  );
  const daily = await query(
     `WITH week AS (
       SELECT generate_series(
         CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int * INTERVAL '1 day',
         CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int * INTERVAL '1 day' + INTERVAL '6 days',
         INTERVAL '1 day'
       )::date AS day
     ),
     session_totals AS (
       SELECT DATE(start_time) AS day,
              COUNT(*) AS sessions,
              SUM(target_time) AS focus_time,
              EXTRACT(EPOCH FROM SUM(target_time)) AS total_seconds
       FROM focus_sessions
       WHERE user_id = $1
         AND status = $2
         AND start_time >= CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int * INTERVAL '1 day'
         AND start_time < CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int * INTERVAL '1 day' + INTERVAL '7 days'
       GROUP BY DATE(start_time)
     )
     SELECT week.day,
            week.day AS date,
            COALESCE(session_totals.sessions, 0) AS sessions,
            COALESCE(session_totals.sessions, 0) AS sessions_count,
            COALESCE(session_totals.focus_time, INTERVAL '0 seconds') AS focus_time,
            COALESCE(session_totals.total_seconds, 0) AS total_seconds
     FROM week
     LEFT JOIN session_totals ON session_totals.day = week.day
     ORDER BY week.day`,
    [userId, completed_session_status]
  );
  const streakRows = await query(
    `SELECT DISTINCT DATE(start_time) AS day FROM focus_sessions
     WHERE user_id = $1 AND status = $2 ORDER BY day ASC`,
    [userId, completed_session_status]
  );
  const allDays = streakRows.rows.map((r) => r.day);

  return {
    ...totals.rows[0],
    longest_streak: calculateLongestStreak(allDays),
    current_streak: calculateCurrentStreak(allDays),
    daily: daily.rows,
  };
};

export { logSession, pauseSession, resumeSession, completeSession, cancelSession, getSessionHistory, getSessionStats };
