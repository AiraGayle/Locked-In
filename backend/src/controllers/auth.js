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