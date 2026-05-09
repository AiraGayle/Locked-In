import { updateUserAvatar, updateUsername } from '../services/users.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 400, 'No file uploaded');

    const avatarUrl = req.file.path;
    const user = await updateUserAvatar(req.user.userId, avatarUrl);
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, err.statusCode ?? 500, err.message ?? 'Internal server error');
  }
};

export const editUsername = async (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) return sendError(res, 400, 'Username is required');

  try {
    const user = await updateUsername(req.user.userId, username.trim());
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, err.statusCode ?? 500, err.message ?? 'Internal server error');
  }
};