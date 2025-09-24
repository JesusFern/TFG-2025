import { Router } from 'express';
import { 
  crearEjercicio, 
  obtenerEjercicios, 
  obtenerEjercicioPorId,
  obtenerEjercicioPorSlug,
  actualizarEjercicio, 
  eliminarEjercicio 
} from '../../controllers/training/ejercicioController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';
import { 
  crearEjercicioValidator, 
  actualizarEjercicioValidator, 
  filtrosEjerciciosValidator,
  idValidator,
  slugValidator
} from '../../validators/trainingValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';
import uploadVideo from '../../config/multerVideo';
import { handleVideoUploadError } from '../../middlewares/uploadVideoMiddleware';

const router = Router();

// Rutas para ejercicios
router.post('/', uploadVideo.single('video'), handleVideoUploadError, authenticateToken, authorizeWorker, crearEjercicioValidator, validateRequest, crearEjercicio);
router.get('/', authenticateToken, filtrosEjerciciosValidator, validateRequest, obtenerEjercicios);
router.get('/slug/:slug', authenticateToken, slugValidator, validateRequest, obtenerEjercicioPorSlug);
router.get('/:id', authenticateToken, idValidator, validateRequest, obtenerEjercicioPorId);
router.put('/:id', authenticateToken, authorizeWorker, actualizarEjercicioValidator, validateRequest, actualizarEjercicio);
router.delete('/:id', authenticateToken, authorizeWorker, idValidator, validateRequest, eliminarEjercicio);

export default router;
