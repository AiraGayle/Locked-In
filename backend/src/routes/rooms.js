import { Router } from 'express';
// TODO: import { createRoom, joinRoom, getRoom, leaveRoom, kickMember } from '../controllers/rooms.js'
// TODO: import authenticate from '../middleware/authenticate.js'

const router = Router();

// All room routes require a logged-in user
// TODO: router.use(authenticate);

// TODO: POST /api/rooms — create a new room, generate unique invite code
// router.post('/', createRoom);

// TODO: POST /api/rooms/join — join a room using an invite code
// router.post('/join', joinRoom);

// TODO: GET /api/rooms/:roomId — get room details + current members
// router.get('/:roomId', getRoom);

// TODO: DELETE /api/rooms/:roomId/leave — remove self from room
// router.delete('/:roomId/leave', leaveRoom);

// TODO: DELETE /api/rooms/:roomId/members/:userId — kick a member (room owner only)
// router.delete('/:roomId/members/:userId', kickMember);

export default router;