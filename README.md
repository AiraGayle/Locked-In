# Locked-In

A real-time collaborative productivity web app where users join shared virtual rooms and run synchronized focus timers together.

---

## Features

- **Room System** — Create or join Locked-Ins using a unique, shareable invite code
- **Real-Time Presence** — View all active participants and their timer status (active, paused, completed)
- **Personal Timers** — Start, pause, and complete focus sessions synced live across all room members
- **Session History** — Automatically stored per-user focus sessions for long-term productivity tracking
- **Weekly Stats** — Structured weekly progress view to help build consistent habits
- **Offline Support** — App shell loads offline; active timers continue running locally without internet

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd focus-room
```

### 2. Set up the backend

```bash
cd backend
npm install
# Copy the example env file and fill in your values:
cp .env.example .env
```

Open `.env` and update:

```
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/focus_room
JWT_SECRET=any_long_random_string_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Set up the database

Open PostgreSQL and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE focus_room;
\q
```

Run the migrations in order:

```bash
psql -U postgres -d focus_room -f migrations/create-users.sql
psql -U postgres -d focus_room -f migrations/create-rooms.sql
psql -U postgres -d focus_room -f migrations/create-room-members.sql
psql -U postgres -d focus_room -f migrations/create-focus-sessions.sql
```

Verify the tables were created:

```bash
psql -U postgres -d focus_room
\dt
\q
```

You should see: `users`, `rooms`, `room_members`, `focus_sessions`.

### 4. Set up the frontend

```bash
cd ../frontend
npm install
# Copy the example env file:
cp .env.example .env
```

The defaults should work as-is:

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## Running the App

Open two terminals and run both servers at the same time.

**Terminal 1 — backend**

```bash
cd backend
npm run dev
```

Expected output:

```
[nodemon] starting `node src/index.js`
Server running on port 3000
[cron] CleanRooms job scheduled (every hour)
```

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v5.x ready in ~300ms
➜ Local: http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
focus-room/
├── backend/
│   ├── migrations/         # SQL files — run once to create DB tables
│   │   ├── create-users.sql
│   │   ├── create-rooms.sql
│   │   ├── create-room-members.sql
│   │   └── create-focus-sessions.sql
│   └── src/
│       ├── config/
│       │   ├── db.js       # PostgreSQL pool connection
│       │   └── cloudinary.js # Cloudinary configuration
│       ├── controllers/    # Read req, call service, send res
│       │   ├── auth.js
│       │   ├── room.js
│       │   ├── session.js
│       │   └── users.js
│       ├── jobs/
│       │   └── clean-rooms.js # Cron job — removes empty/expired rooms
│       ├── middleware/
│       │   └── auth.js     # JWT auth guard
│       ├── routes/
│       │   ├── auth.js
│       │   ├── room.js
│       │   ├── session.js
│       │   └── users.js
│       ├── services/
│       │   ├── api-client.js
│       │   ├── auth.js
│       │   ├── room.js
│       │   ├── session.js
│       │   └── users.js
│       ├── utils/
│       │   ├── mailer.js   # Email utility
│       │   └── response.js # Response helper
│       ├── ws/
│       │   └── ws-server.js # WebSocket server + broadcast logic
│       └── index.js         # Entry point
└── frontend/
    ├── public/
    │   └── service-worker.js # PWA service worker
    └── src/
        ├── cards/           # Reusable card components
        ├── components/      # UI components
        │   ├── modal/
        │   ├── navbar/
        │   ├── room-card/
        │   ├── room-member-list/
        │   ├── stat-card/
        │   └── timer/
        ├── hooks/           # Custom React hooks
        │   ├── active-session.js
        │   ├── room-members.js
        │   ├── timer-handler.js
        │   └── timer-state.js
        ├── modals/          # Modal components
        ├── pages/           # Page components
        │   ├── auth/
        │   ├── dashboard/
        │   ├── room/
        │   └── stats/
        ├── services/        # API and WebSocket clients
        │   ├── api-client.js
        │   ├── auth.js
        │   ├── room.js
        │   ├── session.js
        │   ├── users.js
        │   └── ws-client.js
        ├── utils/           # Utility functions
        │   ├── sw.js        # Service worker utilities
        │   └── time.js      # Time formatting utilities
        ├── App.jsx          # Main app component
        ├── index.css        # Global styles
        └── main.jsx         # App entry point
```

---

### Useful Commands

```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm run dev

# Frontend build for production
cd frontend && npm run build

# Database connection test
psql -U postgres -d focus_room
```