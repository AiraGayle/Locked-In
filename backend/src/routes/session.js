import { Router } from 'express';
// import { authMiddleware } from '../middleware/auth-middleware.js';
import authenticate from '../middleware/authenticate.js';
import {
  getSessions,
  getStats,
  startSession,
  pause,
  resume,
  complete,
  cancel,
} from '../controllers/session.js';

const router = Router();

// router.use(authMiddleware);
router.use(authenticate);

router.get('/', getSessions);
router.get('/stats', getStats);
router.post('/', startSession);
router.post('/:id/pause', pause);
router.post('/:id/resume', resume);
router.post('/:id/complete', complete);
router.post('/:id/cancel', cancel);

export default router;