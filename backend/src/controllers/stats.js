// TODO: import pool from '../config/db.js'

// getStats(req, res)
// TODO: query focus_sessions for req.user.userId
// TODO: calculate total focus time (sum of duration_seconds across all completed sessions)
// TODO: calculate sessions per day for the last 7 days (group by DATE(started_at))
// TODO: calculate current streak — count consecutive days going back from today
//        that have at least one completed session
// TODO: return all three values as JSON