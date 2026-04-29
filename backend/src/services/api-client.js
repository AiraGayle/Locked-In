const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = () => sessionStorage.getItem('token');

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data.data;
};

const get = (path) => {
  return fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  }).then(handleResponse);
};

const post = (path, body) => {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);
};

export { get, post };