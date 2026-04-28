
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired'
      : 'Invalid token';
    return next(new AppError(message, 401));
  }
};

export default authenticate;