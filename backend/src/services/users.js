import { query } from '../config/db.js';
import { createError } from '../utils/response.js';
import cloudinary from '../config/cloudinary.js';

const extractPublicId = (url) => {
  try {
    const parts = url.split('/upload/')[1];
    const withoutVersion = parts.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  const { rows: current } = await query(
    'SELECT avatar_url FROM users WHERE id = $1',
    [userId]
  );

  if (current[0]?.avatar_url) {
    const publicId = extractPublicId(current[0].avatar_url);
    if (publicId) await cloudinary.uploader.destroy(publicId);
  }

  const { rows } = await query(
    'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, email, avatar_url, created_at',
    [avatarUrl, userId]
  );

  if (!rows[0]) throw createError('User not found', 404);
  return rows[0];
};

export const updateUsername = async (userId, username) => {
  const { rows: existing } = await query(
    'SELECT id FROM users WHERE username = $1 AND id != $2',
    [username, userId]
  );
  if (existing.length > 0) throw createError('Username already taken', 409);

  const { rows } = await query(
    'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email, avatar_url, created_at',
    [username, userId]
  );

  if (!rows[0]) throw createError('User not found', 404);
  return rows[0];
};