import { post, get } from './api-client.js';

export const register = async ({ username, email, password }) => {
  const data = await post('/auth/register', { username, email, password });
  sessionStorage.setItem('token', data.token);
  sessionStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const login = async ({ email, password }) => {
  const data = await post('/auth/login', { email, password });
  sessionStorage.setItem('token', data.token);
  sessionStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const logout = async () => {
  try {
    await post('/auth/logout');
  } finally {
    sessionStorage.removeItem('token');
  }
};

export const getMe = async () => {
  const data = await get('/auth/me');
  return data;
};

export const isAuthenticated = () => !!sessionStorage.getItem('token');

export const getCurrentUser = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const forgotPassword = async ({ email }) => {
  const data = await post('/auth/forgot-password', { email });
  return data;
};