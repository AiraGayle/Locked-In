const db = require('../config/db');

// TODO 1: Start a session
// POST /api/sessions/start
// - Get user_id from req.user (set by JWT middleware)
// - Get room_id from req.body (optional, user might focus alone)
// - Insert a new row into focus_sessions with:
//     user_id, room_id, started_at = NOW(), completed_at = NULL
// - Return the created session row (id, user_id, room_id, started_at)
// - Return 201 on success, 500 on error
const startSession = async (req, res) => {
  // TODO: implement
};

// TODO 2: End a session
// POST /api/sessions/end
// - Get session_id from req.body
// - Get user_id from req.user (make sure the session belongs to this user)
// - Calculate duration_minutes from started_at to NOW()
// - Update the row in focus_sessions:
//     SET completed_at = NOW(), duration_minutes = <calculated>
//     WHERE id = session_id AND user_id = req.user.id
// - Return the updated session row
// - Return 400 if session not found or already ended
// - Return 500 on error
const endSession = async (req, res) => {
  // TODO: implement
};

// TODO 3: Get session history for the current user
// GET /api/sessions
// - Get user_id from req.user
// - Query all rows in focus_sessions WHERE user_id = req.user.id
// - Order by started_at DESC (most recent first)
// - Return the array of sessions
// - Return 500 on error
const getSessions = async (req, res) => {
  // TODO: implement
};

module.exports = { startSession, endSession, getSessions };