import { Router } from 'express';
import { 
  actualizarSeguimientoPlato, 
  obtenerSeguimientoPlatos, 
  obtenerEstadisticasSeguimiento,
  obtenerEstadisticasGenerales,
  obtenerEstadisticasSemanal,
  obtenerProgresoComidas,
  obtenerRachasNutricionales
} from '../../controllers/diets/seguimientoComidaController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  actualizarSeguimientoPlatoValidator, 
  obtenerSeguimientoPlatosValidator, 
  obtenerEstadisticasSeguimientoValidator,
  obtenerEstadisticasGeneralesValidator,
  obtenerEstadisticasSemanalValidator,
  obtenerProgresoComidasValidator,
  obtenerRachasNutricionalesValidator
} from '../../validators/diets/seguimientoComidaValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// Rutas de seguimiento de platos
router.put('/:dietaId/dias/:diaIndex/comidas/:comidaIndex/platos/:platoIndex/seguimiento', 
  authenticateToken, 
  actualizarSeguimientoPlatoValidator, 
  validateRequest, 
  actualizarSeguimientoPlato
);

router.get('/:dietaId/seguimiento', 
  authenticateToken, 
  obtenerSeguimientoPlatosValidator, 
  validateRequest, 
  obtenerSeguimientoPlatos
);

router.get('/:dietaId/estadisticas-seguimiento', 
  authenticateToken, 
  obtenerEstadisticasSeguimientoValidator, 
  validateRequest, 
  obtenerEstadisticasSeguimiento
);

// Rutas de estadísticas nutricionales generales
router.get('/estadisticas-generales', 
  authenticateToken, 
  obtenerEstadisticasGeneralesValidator, 
  validateRequest, 
  obtenerEstadisticasGenerales
);

router.get('/estadisticas-semanal', 
  authenticateToken, 
  obtenerEstadisticasSemanalValidator, 
  validateRequest, 
  obtenerEstadisticasSemanal
);

router.get('/progreso-comidas', 
  authenticateToken, 
  obtenerProgresoComidasValidator, 
  validateRequest, 
  obtenerProgresoComidas
);

router.get('/rachas-nutricionales', 
  authenticateToken, 
  obtenerRachasNutricionalesValidator, 
  validateRequest, 
  obtenerRachasNutricionales
);

export default router;
