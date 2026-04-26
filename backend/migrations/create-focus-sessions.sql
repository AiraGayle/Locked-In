CREATE TABLE IF NOT EXISTS focus_sessions (
  id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id        UUID      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time     TIMESTAMP NOT NULL DEFAULT NOW(),
  end_time       TIMESTAMP,
  target_time    INTERVAL  NOT NULL,
  remaining_time INTERVAL  NOT NULL,
  status         VARCHAR(10) NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'paused', 'completed', 'cancelled'))
);