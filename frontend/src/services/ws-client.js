const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

let socket = null;
let currentRoomId = null;
const listeners = {};

const getToken = () => sessionStorage.getItem('token');

const connect = (roomId) => {
  currentRoomId = roomId;
  socket = new WebSocket(`${WS_URL}?token=${getToken()}&roomId=${roomId}`);
  socket.onopen = () => console.log('[ws] Connected to room:', roomId);
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const handlers = listeners[message.type] || [];
    handlers.forEach((handler) => handler(message.payload));
  };
  socket.onclose = () => { console.log('[ws] Disconnected'); currentRoomId = null; };
  socket.onerror = (err) => console.error('[ws] Error:', err);
};

const disconnect = () => {
  if (socket) { socket.close(); socket = null; currentRoomId = null; }
};

const send = (type, payload = {}) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, roomId: currentRoomId, payload }));
  }
};

const on = (type, handler) => {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(handler);
};

const off = (type, handler) => {
  if (!listeners[type]) return;
  listeners[type] = listeners[type].filter((h) => h !== handler);
};

export { connect, disconnect, send, on, off };