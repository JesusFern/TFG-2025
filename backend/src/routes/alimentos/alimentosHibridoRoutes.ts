import { Router } from 'express';
import { buscarAlimentosHibrido, buscarAlimentosLocales, verificarServiciosAlimentacion } from '../../controllers/alimentos/alimentosHibridoController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { validarBusquedaHibrida } from '../../validators/alimentosValidators';

const router = Router();

router.get(
  '/buscar-hibrido',
  authenticateToken,
  validarBusquedaHibrida,
  validateRequest,
  buscarAlimentosHibrido
);

router.get(
  '/buscar-locales',
  authenticateToken,
  validarBusquedaHibrida,
  validateRequest,
  buscarAlimentosLocales
);

router.get(
  '/verificar-servicios',
  authenticateToken,
  verificarServiciosAlimentacion
);

export default router;

