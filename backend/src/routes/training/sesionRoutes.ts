import { Router } from 'express';
import { 
  crearSesion, 
  obtenerSesiones, 
  obtenerSesionPorId,
  actualizarSesion, 
  eliminarSesion,
  marcarSesionCompletada,
  agregarNotasSesion
} from '../../controllers/training/sesionController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';
import { 
  crearSesionValidator, 
  actualizarSesionValidator, 
  filtrosSesionesValidator,
  idValidator,
  marcarSesionCompletadaValidator,
  agregarNotasSesionValidator
} from '../../validators/trainingValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// Rutas para sesiones
router.post('/', authenticateToken, authorizeWorker, crearSesionValidator, validateRequest, crearSesion);
router.get('/', authenticateToken, filtrosSesionesValidator, validateRequest, obtenerSesiones);
router.get('/:id', authenticateToken, idValidator, validateRequest, obtenerSesionPorId);
router.put('/:id', authenticateToken, authorizeWorker, actualizarSesionValidator, validateRequest, actualizarSesion);
router.delete('/:id', authenticateToken, authorizeWorker, idValidator, validateRequest, eliminarSesion);

// Rutas específicas para clientes
router.patch('/:id/completar', authenticateToken, marcarSesionCompletadaValidator, validateRequest, marcarSesionCompletada);
router.patch('/:id/notas', authenticateToken, agregarNotasSesionValidator, validateRequest, agregarNotasSesion);

export default router;
