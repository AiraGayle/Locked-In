import { query } from '../db/db.js';
import { randomBytes } from 'crypto';

const generateInviteCode = () => randomBytes(4).toString('hex').toUpperCase();

const createRoom = async ({ name, hostId }) => {
  const inviteCode = generateInviteCode();
  const roomResult = await query(
    'INSERT INTO rooms (name, invite_code, created_by) VALUES ($1, $2, $3) RETURNING *',
    [name, inviteCode, hostId]
  );
  const room = roomResult.rows[0];
  await query(
    'INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3)',
    [room.id, hostId, 'host']
  );
  return room;
};

const getUserRooms = async (userId) => {
  const result = await query(
    `SELECT r.* FROM rooms r
     JOIN room_members rm ON rm.room_id = r.id
     WHERE rm.user_id = $1 AND rm.status IN ('active', 'idle')
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getRoomById = async (roomId) => {
  const roomResult = await query('SELECT * FROM rooms WHERE id = $1', [roomId]);
  if (roomResult.rows.length === 0) throw new Error('Room not found');

  const membersResult = await query(
    `SELECT rm.role, rm.status, u.id AS user_id, u.username,
            fs.id AS session_id, fs.start_time, 
            EXTRACT(EPOCH FROM fs.target_time) AS target_seconds,
            EXTRACT(EPOCH FROM fs.remaining_time) AS remaining_seconds,
            fs.status AS session_status
     FROM room_members rm
     JOIN users u ON u.id = rm.user_id
     LEFT JOIN focus_sessions fs
       ON fs.user_id = rm.user_id AND fs.room_id = $1 AND fs.status IN ('ongoing', 'paused')
     WHERE rm.room_id = $1 AND rm.status IN ('active', 'idle')`,
    [roomId]
  );

  // Format members with session data
  const members = membersResult.rows.map(member => ({
    ...member,
    session_id: member.session_id,
    targetSeconds: member.target_seconds || null,
    remainingSeconds: member.remaining_seconds || null,
    startedAt: member.start_time ? new Date(member.start_time).getTime() : null,
    sessionStatus: member.session_status
  }));

  return { ...roomResult.rows[0], members };
};

const joinRoom = async ({ inviteCode, userId }) => {
  const roomResult = await query(
    "SELECT * FROM rooms WHERE invite_code = $1 AND status = 'active'",
    [inviteCode]
  );
  if (roomResult.rows.length === 0) throw new Error('Room not found or already closed');
  const room = roomResult.rows[0];
  await query(
    `INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, 'member')
     ON CONFLICT (room_id, user_id) DO UPDATE SET status = 'idle', left_at = NULL`,
    [room.id, userId]
  );
  await query("UPDATE rooms SET empty_since = NULL WHERE id = $1", [room.id]);
  return room;
};

const checkAndMarkEmpty = async (roomId) => {
  const result = await query(
    `SELECT COUNT(*) FROM room_members
     WHERE room_id = $1 AND status IN ('active', 'idle')`,
    [roomId]
  );
  if (parseInt(result.rows[0].count) === 0) {
    await query('UPDATE rooms SET empty_since = NOW() WHERE id = $1', [roomId]);
  }
};

const leaveRoom = async ({ roomId, userId }) => {
  await query(
    "UPDATE room_members SET status = 'left', left_at = NOW() WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );
  await checkAndMarkEmpty(roomId);
};

const closeRoom = async ({ roomId, hostId }) => {
  const result = await query(
    "SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2 AND role = 'host'",
    [roomId, hostId]
  );
  if (result.rows.length === 0) throw new Error('Only the host can close this room');
  await query("UPDATE rooms SET status = 'closed' WHERE id = $1", [roomId]);
};

const removeMember = async ({ roomId, targetUserId, hostId }) => {
  const result = await query(
    "SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2 AND role = 'host'",
    [roomId, hostId]
  );
  if (result.rows.length === 0) throw new Error('Only the host can remove members');
  await query(
    "UPDATE room_members SET status = 'removed', left_at = NOW() WHERE room_id = $1 AND user_id = $2",
    [roomId, targetUserId]
  );
  await checkAndMarkEmpty(roomId);
};

export { createRoom, getUserRooms, getRoomById, joinRoom, leaveRoom, closeRoom, removeMember };