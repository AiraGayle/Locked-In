import { Router } from 'express';
import { uploadAvatar, editUsername } from '../controllers/users.js';
import authenticate from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.patch('/me/username', authenticate, editUsername);

export default router;