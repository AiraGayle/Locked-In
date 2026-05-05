
import jwt from 'jsonwebtoken';
import { createError } from '../utils/response.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired'
      : 'Invalid token';
    return next(createError(message, 401));
  }
};

export default authenticate;