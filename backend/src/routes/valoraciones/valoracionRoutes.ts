import { Router } from 'express';
import { ValoracionController } from '../../controllers/valoraciones/valoracionController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import {
  createValoracionValidator,
  updateValoracionValidator,
  getValoracionesValidator,
  getValoracionValidator,
  deleteValoracionValidator,
  getEstadisticasValidator,
  validateClientePuedeValorar
} from '../../validators/valoracionValidators';

const router = Router();

// Rutas públicas (solo para obtener valoraciones y estadísticas)
router.get(
  '/',
  getValoracionesValidator,
  validateRequest,
  ValoracionController.getValoraciones
);

router.get(
  '/stats',
  getEstadisticasValidator,
  validateRequest,
  ValoracionController.getValoracionStats
);

router.get(
  '/trabajador/:trabajadorId',
  getValoracionesValidator,
  validateRequest,
  ValoracionController.getValoracionesByTrabajador
);

router.get(
  '/:id',
  getValoracionValidator,
  validateRequest,
  ValoracionController.getValoracionById
);

// Rutas protegidas (requieren autenticación)
router.post(
  '/',
  authenticateToken,
  createValoracionValidator,
  validateRequest,
  validateClientePuedeValorar,
  ValoracionController.createValoracion
);

router.get(
  '/cliente/:clienteId',
  authenticateToken,
  getValoracionesValidator,
  validateRequest,
  ValoracionController.getValoracionesByCliente
);

router.put(
  '/:id',
  authenticateToken,
  updateValoracionValidator,
  validateRequest,
  ValoracionController.updateValoracion
);

router.delete(
  '/:id',
  authenticateToken,
  deleteValoracionValidator,
  validateRequest,
  ValoracionController.deleteValoracion
);

router.get(
  '/can-valorar/verify',
  authenticateToken,
  ValoracionController.canClienteValorarTrabajador
);

router.get(
  '/trabajador/:trabajadorId/tipos-disponibles',
  authenticateToken,
  ValoracionController.getTiposTrabajadorDisponibles
);

router.get(
  '/trabajador/:trabajadorId/stats-by-tipo',
  ValoracionController.getValoracionStatsByTipo
);

export default router;
