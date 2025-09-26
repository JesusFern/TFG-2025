import { Router } from 'express';
import { 
  obtenerEstadisticasCliente,
  obtenerEstadisticasSemanal,
  obtenerProgresoEjercicios,
  obtenerMiProgreso,
  obtenerMiProgresoSemanal,
  obtenerMiProgresoEjercicios,
  obtenerRachasEntrenamiento,
  obtenerClientesTrabajador,
  obtenerDetallesCliente
} from '../../controllers/training/estadisticasController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  estadisticasClienteValidator,
  estadisticasSemanalValidator,
  progresoEjerciciosValidator,
  miProgresoValidator,
  miProgresoSemanalValidator,
  miProgresoEjerciciosValidator,
  detallesClienteValidator
} from '../../validators/estadisticasValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// Rutas para entrenadores (estadísticas de clientes)
// IMPORTANTE: Las rutas más específicas deben ir primero
router.get(
  '/cliente/:clienteId/semanal/:numeroSemana/:anio',
  authenticateToken,
  estadisticasSemanalValidator,
  validateRequest,
  obtenerEstadisticasSemanal
);

router.get(
  '/cliente/:clienteId/ejercicios',
  authenticateToken,
  progresoEjerciciosValidator,
  validateRequest,
  obtenerProgresoEjercicios
);

router.get(
  '/cliente/:clienteId',
  authenticateToken,
  estadisticasClienteValidator,
  validateRequest,
  obtenerEstadisticasCliente
);

// Rutas para clientes (su propio progreso)
router.get(
  '/mi-progreso',
  authenticateToken,
  miProgresoValidator,
  validateRequest,
  obtenerMiProgreso
);

router.get(
  '/mi-progreso/semanal',
  authenticateToken,
  miProgresoSemanalValidator,
  validateRequest,
  obtenerMiProgresoSemanal
);

router.get(
  '/mi-progreso/ejercicios',
  authenticateToken,
  miProgresoEjerciciosValidator,
  validateRequest,
  obtenerMiProgresoEjercicios
);

// Ruta para rachas de entrenamiento (solo para clientes)
router.get(
  '/rachas',
  authenticateToken,
  obtenerRachasEntrenamiento
);

// Ruta para obtener clientes del trabajador
router.get(
  '/trabajador/clientes',
  authenticateToken,
  obtenerClientesTrabajador
);

// Ruta para obtener detalles completos de un cliente específico
router.get(
  '/trabajador/cliente/:clienteId',
  authenticateToken,
  detallesClienteValidator,
  validateRequest,
  obtenerDetallesCliente
);

export default router;
