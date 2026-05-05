
import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;