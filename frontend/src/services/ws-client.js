const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

let socket = null;
let currentRoomId = null;
const listeners = {};

const getToken = () => sessionStorage.getItem('token');

const connect = (roomId) => {
  // Close any stale socket silently (code 4000) before opening a new connection.
  // Code 4000 tells the server to skip the leaveRoom DB update, so a user who
  // navigated away without quitting keeps their room membership intact.
  if (socket) { socket.close(4000); socket = null; }
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

// Intentional leave (quit button). Code 1000 = normal closure;
// the server will call leaveRoom and set room_members.status = 'left'.
const disconnect = () => {
  if (socket) { socket.close(1000); socket = null; currentRoomId = null; }
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