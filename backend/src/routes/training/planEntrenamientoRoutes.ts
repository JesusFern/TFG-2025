import { Router } from 'express';
import { 
  crearPlanEntrenamiento, 
  obtenerPlanesEntrenamiento, 
  obtenerPlanEntrenamientoPorId,
  actualizarPlanEntrenamiento, 
  eliminarPlanEntrenamiento,
  asignarCliente,
  removerCliente
} from '../../controllers/training/planEntrenamientoController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';
import { 
  crearPlanEntrenamientoValidator, 
  actualizarPlanEntrenamientoValidator, 
  filtrosPlanesValidator,
  idValidator,
  asignarClienteValidator,
  removerClienteValidator
} from '../../validators/trainingValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// Rutas para planes de entrenamiento
router.post('/', authenticateToken, authorizeWorker, crearPlanEntrenamientoValidator, validateRequest, crearPlanEntrenamiento);
router.get('/', authenticateToken, filtrosPlanesValidator, validateRequest, obtenerPlanesEntrenamiento);
router.get('/:id', authenticateToken, idValidator, validateRequest, obtenerPlanEntrenamientoPorId);
router.put('/:id', authenticateToken, authorizeWorker, actualizarPlanEntrenamientoValidator, validateRequest, actualizarPlanEntrenamiento);
router.delete('/:id', authenticateToken, authorizeWorker, idValidator, validateRequest, eliminarPlanEntrenamiento);

// Rutas para gestión de clientes
router.post('/:id/clientes', authenticateToken, authorizeWorker, asignarClienteValidator, validateRequest, asignarCliente);
router.delete('/:id/clientes/:clienteId', authenticateToken, authorizeWorker, removerClienteValidator, validateRequest, removerCliente);

export default router;
