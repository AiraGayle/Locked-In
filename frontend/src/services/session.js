import { get, post } from './api-client.js';

const getSessions = () => get('/sessions');

const getStats = () => get('/sessions/stats');

const startSession = (roomId, targetSeconds) => post('/sessions', { roomId, targetSeconds });

const pauseSession = (sessionId) => post(`/sessions/${sessionId}/pause`);

const resumeSession = (sessionId) => post(`/sessions/${sessionId}/resume`);

const completeSession = (sessionId) => post(`/sessions/${sessionId}/complete`);

const cancelSession = (sessionId) => post(`/sessions/${sessionId}/cancel`);

export { getSessions, getStats, startSession, pauseSession, resumeSession, completeSession, cancelSession };