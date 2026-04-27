Focus Room
A real-time collaborative productivity web app where users join shared virtual rooms and run synchronized focus timers together.
Features

Room System — Create or join focus rooms using a unique, shareable invite code
Real-Time Presence — View all active participants and their timer status (active, paused, completed)
Personal Timers — Start, pause, and complete focus sessions synced live across all room members
Session History — Automatically stored per-user focus sessions for long-term productivity tracking
Weekly Stats — Structured weekly progress view to help build consistent habits
Offline Support — App shell loads offline; active timers continue running locally without internet

Getting started

1. Clone the repo
   bashgit clone <repo-url>
   cd focus-room
2. Set up the backend
   bashcd backend
   npm install
   Copy the example env file and fill in your values:
   bashcp .env.example .env
   Open .env and update:
   PORT=3000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/focus_room
   JWT_SECRET=any_long_random_string_at_least_32_characters
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
3. Set up the database
   Open PostgreSQL and create the database:
   bashpsql -U postgres
   sqlCREATE DATABASE focus_room;
   \q
   Run the migrations in order:
   bashpsql -U postgres -d focus_room -f migrations/create-users.sql
   psql -U postgres -d focus_room -f migrations/create-rooms.sql
   psql -U postgres -d focus_room -f migrations/create-room-members.sql
   psql -U postgres -d focus_room -f migrations/create-focus-sessions.sql
   Verify the tables were created:
   bashpsql -U postgres -d focus_room
   \dt
   \q
   You should see: users, rooms, room_members, focus_sessions.
4. Set up the frontend
   bashcd ../frontend
   npm install
   Copy the example env file:
   bashcp .env.example .env
   The defaults should work as-is:
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000

Running the app
Open two terminals and run both servers at the same time.
Terminal 1 — backend
bashcd backend
npm run dev
Expected output:
[nodemon] starting `node src/app.js`
Server running on port 3000
[cron] CleanRooms job scheduled (every hour)
Terminal 2 — frontend
bashcd frontend
npm run dev
Expected output:
VITE v5.x ready in ~300ms
➜ Local: http://localhost:5173/
Open http://localhost:5173 in your browser.

Project structure
focus-room/
├── backend/
│ ├── migrations/ # SQL files — run once to create DB tables
│ └── src/
│ ├── config/
│ │ └── db.js # PostgreSQL pool connection
│ ├── controllers/ # Read req, call service, send res
│ │ ├── auth.js
│ │ ├── rooms.js
│ │ ├── sessions.js
│ │ └── stats.js
│ ├── jobs/
│ │ └── cleanRooms.js # Cron job — removes empty/expired rooms
│ ├── middleware/
│ │ └── authenticate.js # JWT auth guard
│ ├── routes/
│ │ ├── auth.js
│ │ ├── rooms.js
│ │ ├── sessions.js
│ │ └── stats.js
│ ├── services/
│ │ └── websocket.js # WebSocket server + broadcast logic
│ ├── utils/
│ │ └── inviteCode.js # Invite code generator
│ └── index.js # Entry point
└── frontend/
├── public/
└── src/
├── assets/

What still needs to be built
Each file in backend/src/ has inline // TODO comments marking exactly what to implement. Here's the high-level breakdown by feature:
Authentication (src/routes/auth.js, src/controllers/auth.js, src/middleware/authenticate.js)

POST /api/auth/register — hash password with bcrypt, insert user, return JWT
POST /api/auth/login — verify credentials, return JWT
GET /api/auth/me — return current user from token
JWT middleware that protects all private routes

Rooms (src/routes/rooms.js, src/controllers/rooms.js, src/utils/inviteCode.js)

POST /api/rooms — create room, generate unique invite code
POST /api/rooms/join — join by invite code
GET /api/rooms/:roomId — get room + member list
DELETE /api/rooms/:roomId/leave — leave room
DELETE /api/rooms/:roomId/members/:userId — kick member (owner only)

WebSocket (src/services/websocket.js, src/index.js)

Attach WebSocket server to the existing HTTP server (share the same port)
Authenticate connections via token in query string
Handle message types: TIMER_START, TIMER_PAUSE, TIMER_COMPLETE, TIMER_SYNC_REQUEST
Broadcast timer state changes to all members in the same room
Broadcast MEMBER_LEFT on disconnect

Sessions (src/routes/sessions.js, src/controllers/sessions.js)

POST /api/sessions/start — log session start
POST /api/sessions/end — mark complete, store duration
GET /api/sessions — return session history for current user

Stats (src/routes/stats.js, src/controllers/stats.js)

GET /api/stats — return total focus time, sessions per day (last 7 days), current streak
Design and connect the Stats page on the frontend

Room cleanup (src/jobs/cleanRooms.js)

Cron job that runs hourly
Deletes rooms with no members or where all members have been inactive for over 1 hour
Import in index.js so it registers on startup

Offline support (frontend)

Register a service worker so the app shell loads without internet
Keep the active timer running locally if the connection drops
Sync timer state back to the server on reconnect

Performance

Run a Lighthouse audit and target 90+ on Performance, Accessibility, and Best Practices
Lazy load routes to reduce initial bundle size
