const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const getToken = () => sessionStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // If 401, token is invalid or expired — clear session
    if (res.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
    throw new Error(data.message ?? 'Something went wrong');
  }

  return data;
};

export const get = (endpoint) =>
  request(endpoint, { method: 'GET' });

export const post = (endpoint, body) =>
  request(endpoint, { method: 'POST', body: JSON.stringify(body) });

export const put = (endpoint, body) =>
  request(endpoint, { method: 'PUT', body: JSON.stringify(body) });

export const patch = (endpoint, body) =>
  request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });

export const del = (endpoint) =>
  request(endpoint, { method: 'DELETE' });