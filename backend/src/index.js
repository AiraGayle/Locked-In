import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import sessionRoutes from './routes/session.js';
import userRoutes from './routes/users.js';
import { startCleanRoomsJob } from './jobs/clean-rooms.js';
import { initWsServer } from './ws/ws-server.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);

initWsServer(httpServer);
startCleanRoomsJob();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { httpServer };