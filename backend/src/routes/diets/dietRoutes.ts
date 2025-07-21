import { Router } from 'express';
import { crearDieta } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, authorizeWorker, crearDieta);

export default router;