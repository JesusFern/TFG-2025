import { Router } from 'express';
import {
  crearPlanEntrenamiento,
  obtenerPlanesEntrenamiento,
  obtenerMisPlanes,
  obtenerPlanEntrenamientoPorId,
  actualizarPlanEntrenamiento,
  eliminarPlanEntrenamiento,
  asignarCliente,
  removerCliente,
  publicarPlanEntrenamiento,
  obtenerObjetivosDisponibles,
  obtenerPlantillaPorObjetivo,
  obtenerPlantillasPorFiltros,
  buscarPlantillas,
  generarPlanDesdePlantilla
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
router.get('/mis-planes', authenticateToken, authorizeWorker, obtenerMisPlanes);
router.get('/:id', authenticateToken, idValidator, validateRequest, obtenerPlanEntrenamientoPorId);
router.put('/:id', authenticateToken, authorizeWorker, actualizarPlanEntrenamientoValidator, validateRequest, actualizarPlanEntrenamiento);
router.delete('/:id', authenticateToken, authorizeWorker, idValidator, validateRequest, eliminarPlanEntrenamiento);

// Rutas para gestión de clientes
router.post('/:id/clientes', authenticateToken, authorizeWorker, asignarClienteValidator, validateRequest, asignarCliente);
router.delete('/:id/clientes/:clienteId', authenticateToken, authorizeWorker, removerClienteValidator, validateRequest, removerCliente);

// Ruta para publicar plan de entrenamiento
router.patch('/:id/publicar', authenticateToken, authorizeWorker, idValidator, validateRequest, publicarPlanEntrenamiento);

// ===== RUTAS DE PLANTILLAS =====

// Obtener todos los objetivos disponibles
router.get('/plantillas/objetivos', authenticateToken, obtenerObjetivosDisponibles);

// Obtener plantilla por objetivo específico
router.get('/plantillas/objetivo/:objetivo', authenticateToken, obtenerPlantillaPorObjetivo);

// Obtener plantillas por filtros
router.get('/plantillas/filtrar', authenticateToken, obtenerPlantillasPorFiltros);

// Buscar plantillas por texto
router.get('/plantillas/buscar', authenticateToken, buscarPlantillas);

// Generar plan desde plantilla
router.post('/plantillas/generar', authenticateToken, authorizeWorker, generarPlanDesdePlantilla);

export default router;
