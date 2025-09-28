import { Router } from 'express';
import { 
  crearDietaDesdePlantilla, 
  obtenerTiposArquetipo, 
  obtenerInfoArquetipo 
} from '../../controllers/diets/dietTemplateController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

// Crear dieta desde plantilla arquetipo
router.post('/create', authenticateToken, authorizeNutricionista, crearDietaDesdePlantilla);

// Obtener tipos de arquetipo disponibles
router.get('/arquetipos', authenticateToken, obtenerTiposArquetipo);

// Obtener información de un tipo de arquetipo específico
router.get('/arquetipos/:tipo', authenticateToken, obtenerInfoArquetipo);

export default router;
