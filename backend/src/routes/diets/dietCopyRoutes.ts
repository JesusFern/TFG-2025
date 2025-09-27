import { Router } from 'express';
import { crearDietaDesdeExistenteController } from '../../controllers/diets/dietCopyController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

// Crear dieta desde una dieta existente
router.post('/copy', authenticateToken, authorizeNutricionista, crearDietaDesdeExistenteController);

export default router;
