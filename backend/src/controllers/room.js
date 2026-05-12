import {
  createRoom, getUserRooms, getRoomById,
  joinRoom, leaveRoom, closeRoom, removeMember,
} from '../services/room.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { broadcastAll } from '../ws/ws-server.js';

const getAllRooms = async (req, res) => {
  try {
    const rooms = await getUserRooms(req.user.userId);
    return sendSuccess(res, rooms, 200);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const createNewRoom = async (req, res) => {
  const { name } = req.body;
  if (!name) return sendError(res, 400, 'Room name is required');
  try {
    const room = await createRoom({ name, hostId: req.user.userId });
    return sendSuccess(res, room, 201);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id, req.user.userId);
    return sendSuccess(res, room, 200);
  } catch (err) {
    return sendError(res, 404, err.message);
  }
};

const joinExistingRoom = async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) return sendError(res, 400, 'Invite code is required');
  try {
    const room = await joinRoom({ inviteCode, userId: req.user.userId });
    return sendSuccess(res, room, 200);
  } catch (err) {
    return sendError(res, 404, err.message);
  }
};

const leaveExistingRoom = async (req, res) => {
  try {
    await leaveRoom({ roomId: req.params.id, userId: req.user.userId });
    return sendSuccess(res, { message: 'Left room successfully' }, 200);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const closeExistingRoom = async (req, res) => {
  try {
    await closeRoom({ roomId: req.params.id, hostId: req.user.userId });
    broadcastAll(req.params.id, { type: 'room:close', payload: {} });
    return sendSuccess(res, { message: 'Room closed' }, 200);
  } catch (err) {
    return sendError(res, 403, err.message);
  }
};

const removeRoomMember = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    await removeMember({
      roomId: req.params.id,
      targetUserId,
      hostId: req.user.userId,
    });
    broadcastAll(req.params.id, { type: 'user:removed', payload: { userId: targetUserId } });
    return sendSuccess(res, { message: 'Member removed' }, 200);
  } catch (err) {
    return sendError(res, 403, err.message);
  }
};

export { getAllRooms, createNewRoom, getRoom, joinExistingRoom, leaveExistingRoom, closeExistingRoom, removeRoomMember };
