import { Router } from 'express';
import { 
  crearDietaDesdePlantilla, 
  obtenerTiposArquetipo, 
  obtenerInfoArquetipo,
  generarDietaDesdePlantillaCliente,
  obtenerInfoSuscripcionDietas
} from '../../controllers/diets/dietTemplateController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

// Crear dieta desde plantilla arquetipo (nutricionistas)
router.post('/create', authenticateToken, authorizeNutricionista, crearDietaDesdePlantilla);

// Generar dieta desde plantilla para clientes (sin rol nutricionista)
router.post('/generar-cliente', authenticateToken, generarDietaDesdePlantillaCliente);

// Obtener tipos de arquetipo disponibles
router.get('/arquetipos', authenticateToken, obtenerTiposArquetipo);

// Obtener información de un tipo de arquetipo específico
router.get('/arquetipos/:tipo', authenticateToken, obtenerInfoArquetipo);

// Obtener información de suscripción del usuario para dietas
router.get('/suscripcion/info', authenticateToken, obtenerInfoSuscripcionDietas);

export default router;
