import { Router } from 'express';
import { crearDieta, actualizarPlatos } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, authorizeNutricionista, crearDieta);
router.put('/platos', authenticateToken, authorizeNutricionista, actualizarPlatos);

export default router;