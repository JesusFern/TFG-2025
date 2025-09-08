import { Router } from 'express';
import { authenticateToken, authorizeAdmin, authorizeNutricionista } from '../../middlewares/authMiddleware';
import { registerWorker, getAssignedClients } from '../../controllers/users/workerController';

const router = Router();

router.post('/register', authenticateToken, authorizeAdmin, registerWorker);
router.get('/clients', authenticateToken, authorizeNutricionista, getAssignedClients);

export default router;