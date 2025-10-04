import { Router } from 'express';
import { 
  crearRegistroEjercicio,
  obtenerRegistrosEjercicio,
  obtenerRegistroEjercicioPorId,
  actualizarRegistroEjercicio,
  eliminarRegistroEjercicio,
  marcarRegistroCompletado,
  obtenerProgresoEjercicio,
  verificarSesionCompleta,
  uploadVideoEjercicio
} from '../../controllers/training/registroEjercicioController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  crearRegistroEjercicioValidator,
  actualizarRegistroEjercicioValidator,
  filtrosRegistroEjercicioValidator,
  marcarRegistroCompletadoValidator,
  idValidator,
  sesionIdValidator,
  obtenerProgresoEjercicioValidator
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
  obtenerProgresoEjercicioValidator,
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

// Ruta para subir video de ejercicio
router.post(
  '/upload-video',
  authenticateToken,
  ...uploadVideoEjercicio
);

export default router;
