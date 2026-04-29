import {
  logSession, pauseSession, resumeSession,
  completeSession, cancelSession, getSessionHistory, getSessionStats,
} from '../services/session.js';
import { sendSuccess, sendError } from '../utils/response.js';

const getSessions = async (req, res) => {
  try {
    const sessions = await getSessionHistory(req.user.userId);
    return sendSuccess(res, sessions, 200);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await getSessionStats(req.user.userId);
    return sendSuccess(res, stats, 200);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const startSession = async (req, res) => {
  const { roomId, targetSeconds } = req.body;
  if (!roomId || !targetSeconds) {
    return sendError(res, 400, 'roomId and targetSeconds are required');
  }
  if (typeof targetSeconds !== 'number' || targetSeconds < 1) {
    return sendError(res, 400, 'targetSeconds must be a positive number');
  }
  try {
    const session = await logSession({ userId: req.user.userId, roomId, targetSeconds });
    return sendSuccess(res, session, 201);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const pause = async (req, res) => {
  try {
    const session = await pauseSession({ sessionId: req.params.id, userId: req.user.userId });
    return sendSuccess(res, session, 200);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

const resume = async (req, res) => {
  try {
    const session = await resumeSession({ sessionId: req.params.id, userId: req.user.userId });
    return sendSuccess(res, session, 200);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

const complete = async (req, res) => {
  try {
    const session = await completeSession({ sessionId: req.params.id, userId: req.user.userId });
    return sendSuccess(res, session, 200);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

const cancel = async (req, res) => {
  try {
    const session = await cancelSession({ sessionId: req.params.id, userId: req.user.userId });
    return sendSuccess(res, session, 200);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

export { getSessions, getStats, startSession, pause, resume, complete, cancel };