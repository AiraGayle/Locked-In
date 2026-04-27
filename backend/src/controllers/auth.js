// TODO: import bcrypt — npm install bcrypt
// TODO: import jwt from 'jsonwebtoken'
// TODO: import pool from '../config/db.js'

// register(req, res)
// TODO: validate that email and password are present
// TODO: check if email already exists in users table
// TODO: hash the password with bcrypt (saltRounds = 10)
// TODO: insert new user into users table
// TODO: sign a JWT with { userId, email } and process.env.JWT_SECRET
// TODO: return 201 with the token and basic user info

// login(req, res)
// TODO: find user by email — return 401 if not found
// TODO: compare submitted password with stored hash using bcrypt.compare
// TODO: return 401 if password doesn't match
// TODO: sign and return a JWT on success

// getMe(req, res)
// TODO: use req.user.userId (set by authenticate middleware) to query the user
// TODO: return user info (exclude password hash)

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


import { readUsers, writeUsers } from '../../data/userStore.js';
const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const users = readUsers();

  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = { id: Date.now(), email, password: hashedPassword };

  writeUsers([...users, newUser]);

  const token = jwt.sign({ userId: newUser.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user: { id: newUser.id, email } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user)
    return res.status(401).json({ message: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password);

  if (!match)
    return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: { id: user.id, email } });
};

export const getMe = (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.userId);

  if (!user)
    return res.status(404).json({ message: 'User not found' });

  res.json({ id: user.id, email: user.email });
};