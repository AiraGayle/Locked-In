CREATE TABLE IF NOT EXISTS rooms (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  invite_code VARCHAR(10)  NOT NULL UNIQUE,
  created_by  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  status      VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  empty_since TIMESTAMP
);