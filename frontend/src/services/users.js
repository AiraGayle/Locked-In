import { postFormData, patch } from './api-client.js';

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return postFormData('/api/users/me/avatar', formData);
};

export const updateUsername = (username) =>
  patch('/api/users/me/username', { username });

