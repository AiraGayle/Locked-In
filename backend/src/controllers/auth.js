
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
} from '../services/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';


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

export const register = async (req, res) => {
  const error = validateRegisterInput(req.body);
  if (error) return sendError(res, 400, error);

  try {
    const { username, email, password } = req.body;
    const result = await registerUser({ username, email, password });
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, err.statusCode ?? 500, err.message ?? 'Internal server error');
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
    return sendError(res, err.statusCode ?? 500, err.message ?? 'Internal server error');  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.user.userId);
    return sendSuccess(res, user);
  } catch (err) {
 return sendError(res, err.statusCode ?? 500, err.message ?? 'Internal server error');  }
};

export const logout = (_req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
};