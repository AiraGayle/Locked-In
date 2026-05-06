
import { Router } from 'express';
import { register, login, getMe, logout, forgotPass, resetPass } from '../controllers/auth.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPass);
router.post('/reset-password', resetPass);

export default router;