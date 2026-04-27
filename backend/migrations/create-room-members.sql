CREATE TABLE IF NOT EXISTS room_members (
  room_id   UUID      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id   UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  left_at   TIMESTAMP,
  status    VARCHAR(10) NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'left', 'removed')),
  role      VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'host')),

  PRIMARY KEY (room_id, user_id)
);