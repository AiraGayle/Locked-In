import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { parse } from 'url';

const rooms = new Map();

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const extractToken = (requestUrl) => {
  const { query } = parse(requestUrl, true);
  return query.token || null;
};

const getRoomClients = (roomId) => {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  return rooms.get(roomId);
};

const broadcast = (roomId, senderId, message) => {
  const clients = getRoomClients(roomId);
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === 1 && client.userId !== senderId) {
      client.ws.send(data);
    }
  });
};

const broadcastAll = (roomId, message) => {
  const clients = getRoomClients(roomId);
  const data = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(data);
    }
  });
};

const broadcastDashboardUpdate = () => {
  broadcastAll('__dashboard__', {
    type: 'roomsUpdated',
    payload: {}
  });
};

const addToRoom = (roomId, userId, ws) => {
  const clients = getRoomClients(roomId);
  clients.add({ userId, ws });
};

const removeFromRoom = (roomId, userId) => {
  const clients = getRoomClients(roomId);
  clients.forEach((client) => {
    if (client.userId === userId) clients.delete(client);
  });
  if (clients.size === 0) rooms.delete(roomId);
};

const handleMessage = (ws, userId, rawData) => {
  let message;
  try {
    message = JSON.parse(rawData);
  } catch {
    return;
  }

  const { type, roomId, payload } = message;
  if (!type || !roomId) return;

  // Add server timestamp for timer synchronization
  const serverTimestamp = Date.now();
  broadcast(roomId, userId, { type, payload: { ...payload, userId, serverTimestamp } });
};

const initWsServer = (httpServer) => {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws, request) => {
    const token = extractToken(request.url);
    if (!token) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    let userId;
    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    const { query } = parse(request.url, true);
    const roomId = query.roomId;
    if (!roomId) {
      ws.close(4002, 'roomId required');
      return;
    }

    addToRoom(roomId, userId, ws);
    // Notify OTHER members only — the joining user gets their own data from fetchRoom
    broadcast(roomId, userId, { type: 'user:join', payload: { userId } });

    ws.on('message', (data) => handleMessage(ws, userId, data));

    ws.on('close', () => {
      removeFromRoom(roomId, userId);
      broadcastAll(roomId, { type: 'user:leave', payload: { userId } });
      // Intentionally no leaveRoom() call here. WS disconnects happen for many
      // reasons (refresh, network blip, tab backgrounded) and should not affect
      // persistent membership. Only the explicit HTTP POST /rooms/:id/leave and
      // DELETE /rooms/:id endpoints are authoritative for room_members status.
    });
  });

  console.log('[ws] WebSocket server initialized');
};

export { initWsServer, broadcast, broadcastAll, broadcastDashboardUpdate };