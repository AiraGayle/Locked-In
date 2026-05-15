CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username           VARCHAR(50) NOT NULL UNIQUE,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password           VARCHAR(255) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  avatar_url         VARCHAR(500),
  reset_token        VARCHAR(255),
  reset_token_expiry BIGINT
);