
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
} from '../services/auth-service.js';
import { AppError } from '../errors/AppError.js';

const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });

// --- Validation helpers ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegisterInput = ({ username, email, password }) => {
  if (!username || !email || !password)
    return 'Username, Email, and Password are required';
  if (!isValidEmail(email))
    return 'Invalid email format';
  if (password.length < 6)
    return 'Password must be at least 6 characters';
  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password)
    return 'Email and Password are required';
  return null;
};

// --- Controllers ---
export const register = async (req, res) => {
  const error = validateRegisterInput(req.body);
  if (error) return sendError(res, 400, error);

  try {
    const { username, email, password } = req.body;
    const result = await registerUser({ username, email, password });
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error('Register error:', err);
    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : 'Internal server error';
    return sendError(res, status, message);
  }
};

export const login = async (req, res) => {
  const error = validateLoginInput(req.body);
  if (error) return sendError(res, 400, error);

  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return sendSuccess(res, result);
  } catch (err) {
    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : 'Internal server error';
    return sendError(res, status, message);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.user.userId);
    return sendSuccess(res, user);
  } catch (err) {
    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : 'Internal server error';
    return sendError(res, status, message);
  }
};

export const logout = (_req, res) => {
  // Stateless JWT — invalidation is client-side (drop the token).
  // For server-side invalidation, add a token blocklist here.
  return sendSuccess(res, { message: 'Logged out successfully' });
};