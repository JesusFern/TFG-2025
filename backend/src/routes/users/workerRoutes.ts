import { Router } from 'express';
import { registerWorker } from '../../controllers/users/workerController';
import { authenticateToken, authorizeAdmin } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/register', authenticateToken, authorizeAdmin, registerWorker);

export default router;