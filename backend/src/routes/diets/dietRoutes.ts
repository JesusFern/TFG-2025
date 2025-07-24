import { Router } from 'express';
import { crearDieta, actualizarPlatos } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, authorizeWorker, crearDieta);
router.put('/platos', authenticateToken, authorizeWorker, actualizarPlatos);

export default router;