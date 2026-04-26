# Focus Room

A real-time collaborative productivity web app where users join shared virtual rooms and run synchronized focus timers together.

## Getting started

### 1. Clone the repo

```bash
git clone <repo-url>
cd focus-room
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
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
```

Copy the example env file:

```bash
cp .env.example .env
```

The defaults should work as-is:

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## Running the app

Open **two terminals** and run both servers at the same time.

**Terminal 1 — backend**

```bash
cd backend
npm run dev
```

Expected output:

```
[nodemon] starting `node src/app.js`
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
VITE v5.x  ready in ~300ms
➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## Project structure

```
focus-room/
├── backend/
│   ├── migrations/          # SQL files — run once to create DB tables
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # Read req, call service, send res
│       ├── jobs/            # Cron jobs
│       ├── middleware/      # JWT auth guard
│       ├── routes/          # URL + method definitions
│       ├── services/        # Business logic + DB queries
│       ├── utils/           # Shared helpers
│       └── index.js           # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── assets/
```
