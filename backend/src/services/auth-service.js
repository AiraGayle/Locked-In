import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';
import { query } from '../config/db.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// --- Service functions ---
export const registerUser = async ({ username, email, password }) => {
  const { rows: existing } = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.length > 0)
    throw new AppError('Email already in use', 409);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, hashedPassword]
  );

  const user = rows[0];
  const token = signToken({ userId: user.id, email: user.email });

  return { token, user };
};

export const loginUser = async ({ email, password }) => {
  const { rows } = await query(
    'SELECT id, username, email, password FROM users WHERE email = $1',
    [email]
  );

  // for email enumeration
  const user = rows[0];
  if (!user) throw new AppError('Invalid email or password', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid email or password', 401);

  const token = signToken({ userId: user.id, email: user.email });
  const { password: _, ...safeUser } = user; // strip hash before returning

  return { token, user: safeUser };
};

export const getAuthenticatedUser = async (userId) => {
  const { rows } = await query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (!rows[0]) throw new AppError('User not found', 404);
  return rows[0];
};