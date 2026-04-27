// TODO: import pool from '../config/db.js'
// TODO: import { generateInviteCode } from '../utils/inviteCode.js'

// createRoom(req, res)
// TODO: generate a unique invite code (see utils/inviteCode.js)
// TODO: insert into rooms table with owner = req.user.userId
// TODO: also insert owner into room_members table
// TODO: return 201 with room details and invite code

// joinRoom(req, res)
// TODO: find room by invite code from req.body.inviteCode
// TODO: return 404 if room not found
// TODO: check if user is already a member — return 409 if so
// TODO: insert user into room_members table
// TODO: return room details

// getRoom(req, res)
// TODO: query room by roomId, join with room_members and users
// TODO: return room info + list of members with their current timer status

// leaveRoom(req, res)
// TODO: delete row from room_members where userId = req.user.userId and roomId matches
// TODO: if the leaving user is the owner, either transfer ownership or delete the room

// kickMember(req, res)
// TODO: verify req.user.userId is the room owner — return 403 if not
// TODO: delete the target userId from room_members
// TODO: broadcast a WebSocket event to notify the kicked user