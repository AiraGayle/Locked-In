import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { createError } from '../utils/response.js';
import crypto from 'crypto';
import { resetEmail } from '../utils/mailer.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const registerUser = async ({ username, email, password }) => {
  const { rows: existing } = await query(
    'SELECT id, email, username FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  if (existing.length > 0) 
     {
    const taken = existing[0];
    if (taken.email === email) throw createError('Email already in use', 409);
    throw createError('Username already exists', 409);
  }
   
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
    'SELECT id, username, email, password, created_at, avatar_url FROM users WHERE email = $1',
    [email]
  );

  const user = rows[0];
  if (!user) throw createError('Invalid email or password', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw createError('Invalid email or password', 401);

  const token = signToken({ userId: user.id, email: user.email });
  const { password: _, ...safeUser } = user; 

  return { token, user: safeUser };
};

export const getAuthenticatedUser = async (userId) => {
  const { rows } = await query(
    'SELECT id, username, email, created_at, avatar_url FROM users WHERE id = $1',
    [userId]
  );

  if (!rows[0]) throw createError('User not found', 404);
  return rows[0];
};

export const forgotPassword = async (email) => {
  const { rows } = await query (
    'SELECT id, email FROM users WHERE email = $1',
    [email]
  );

  if (!rows[0]) return { message: 'A reset link has been sent'};

  const user = rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 1000 * 60 * 60;

  await query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [token, expiry, user.id]
  );

  const resetLink = `${process.env.CLIENT_URL}/forgot-password?token=${token}`;

  await resetEmail(user.email, resetLink);

  return { message: 'A reset link has been sent.' };

};

export const resetPassword = async ({token, newPassword}) => {
  const {rows} = await query (
    'SELECT id, reset_token_expiry FROM users WHERE reset_token = $1',
    [token]
  );

  const user = rows[0];

  if (!user || Date.now() > user.reset_token_expiry)
    throw createError('Invalid or expired reset token', 400);

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await query(
    `UPDATE users
     SET password = $1, reset_token = NULL, reset_token_expiry = NULL
     WHERE id = $2`,
    [hashed, user.id]
  );

  return { message: 'Password reset successfully.' };

};