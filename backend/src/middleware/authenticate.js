// TODO: install jsonwebtoken — npm install jsonwebtoken
// TODO: read the Bearer token from req.headers.authorization
// TODO: verify the token using process.env.JWT_SECRET
// TODO: on success, attach decoded payload to req.user and call next()
// TODO: on failure (missing/expired/invalid token), respond 401

// Usage: import this middleware and add to any route that requires login
// Example: router.get('/me', authenticate, getMe);

import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticate;