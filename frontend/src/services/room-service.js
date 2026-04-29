import { get, post } from './api-client.js';

const getRooms = () => get('/rooms');

const getRoom = (roomId) => get(`/rooms/${roomId}`);

const createRoom = (name) => post('/rooms', { name });

const joinRoom = (inviteCode) => post('/rooms/join', { inviteCode });

const leaveRoom = (roomId) => post(`/rooms/${roomId}/leave`);

const closeRoom = (roomId) => post(`/rooms/${roomId}/close`);

const removeMember = (roomId, userId) => post(`/rooms/${roomId}/members/${userId}/remove`);

export { getRooms, getRoom, createRoom, joinRoom, leaveRoom, closeRoom, removeMember };