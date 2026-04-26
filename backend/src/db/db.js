import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

export { query, getClient };