import { Router } from 'express';
import { 
  crearRegistroEjercicio,
  obtenerRegistrosEjercicio,
  obtenerRegistroEjercicioPorId,
  actualizarRegistroEjercicio,
  eliminarRegistroEjercicio,
  marcarRegistroCompletado,
  obtenerProgresoEjercicio,
  verificarSesionCompleta
} from '../../controllers/training/registroEjercicioController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  crearRegistroEjercicioValidator,
  actualizarRegistroEjercicioValidator,
  filtrosRegistroEjercicioValidator,
  marcarRegistroCompletadoValidator,
  idValidator,
  ejercicioIdValidator,
  sesionIdValidator
} from '../../validators/trainingValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// Rutas para registro de ejercicios
router.post(
  '/',
  authenticateToken,
  crearRegistroEjercicioValidator,
  validateRequest,
  crearRegistroEjercicio
);

router.get(
  '/',
  authenticateToken,
  filtrosRegistroEjercicioValidator,
  validateRequest,
  obtenerRegistrosEjercicio
);

router.get(
  '/:id',
  authenticateToken,
  idValidator,
  validateRequest,
  obtenerRegistroEjercicioPorId
);

router.put(
  '/:id',
  authenticateToken,
  actualizarRegistroEjercicioValidator,
  validateRequest,
  actualizarRegistroEjercicio
);

router.delete(
  '/:id',
  authenticateToken,
  idValidator,
  validateRequest,
  eliminarRegistroEjercicio
);

router.patch(
  '/:id/completado',
  authenticateToken,
  marcarRegistroCompletadoValidator,
  validateRequest,
  marcarRegistroCompletado
);

// Rutas para progreso y verificación
router.get(
  '/progreso/:ejercicioId',
  authenticateToken,
  ejercicioIdValidator,
  validateRequest,
  obtenerProgresoEjercicio
);

router.get(
  '/verificar-sesion/:sesionId',
  authenticateToken,
  sesionIdValidator,
  validateRequest,
  verificarSesionCompleta
);

export default router;
