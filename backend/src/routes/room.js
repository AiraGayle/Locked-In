import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getAllRooms,
  createNewRoom,
  getRoom,
  joinExistingRoom,
  leaveExistingRoom,
  closeExistingRoom,
  removeRoomMember,
} from '../controllers/room.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllRooms);
router.post('/', createNewRoom);
router.get('/:id', getRoom);
router.post('/join', joinExistingRoom);
router.post('/:id/leave', leaveExistingRoom);
router.post('/:id/close', closeExistingRoom);
router.post('/:id/members/:userId/remove', removeRoomMember);

export default router;