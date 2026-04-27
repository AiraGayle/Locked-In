import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, 'users.json');

export const readUsers = () => {
  if (!existsSync(FILE_PATH)) return [];
  return JSON.parse(readFileSync(FILE_PATH, 'utf-8'));
};

export const writeUsers = (users) => {
  writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
};