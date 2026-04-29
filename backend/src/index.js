import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startCleanRoomsJob } from './jobs/clean-rooms.js';
// TODO: import http from 'http' and create server for WebSocket support
// TODO: import { initWebSocket } from './services/websocket.js'
// TODO: import authRoutes from './routes/auth.js'
// TODO: import roomRoutes from './routes/rooms.js'
// TODO: import sessionRoutes from './routes/sessions.js'
// TODO: import statsRoutes from './routes/stats.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// TODO: mount routes
// app.use('/api/auth', authRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/sessions', sessionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

// TODO: replace app.listen with server.listen so WebSocket can share the same port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // TODO: call initWebSocket(server) here
  startCleanRoomsJob();
});

