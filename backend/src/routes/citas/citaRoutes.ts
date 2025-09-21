import { Router } from 'express';
import { 
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  actualizarCita,
  cancelarCita,
  reagendarCita,
  confirmarCita,
  completarCita,
  obtenerDisponibilidadProfesional,
  obtenerEstadisticasCitas
} from '../../controllers/citas/citaController';
import { 
  validarCrearCita,
  validarActualizarCita,
  validarCancelarCita,
  validarReagendarCita,
  validarObtenerCita,
  validarObtenerCitas,
  validarObtenerDisponibilidad
} from '../../validators/citaValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { param } from 'express-validator';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para gestión de citas
router.post(
  '/',
  validarCrearCita(),
  validateRequest,
  crearCita
);

router.get(
  '/',
  validarObtenerCitas(),
  validateRequest,
  obtenerCitas
);

router.get(
  '/estadisticas',
  obtenerEstadisticasCitas
);

router.get(
  '/:id',
  validarObtenerCita(),
  validateRequest,
  obtenerCitaPorId
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('ID de cita inválido'),
  validarActualizarCita(),
  validateRequest,
  actualizarCita
);

router.post(
  '/:id/cancelar',
  param('id').isMongoId().withMessage('ID de cita inválido'),
  validarCancelarCita(),
  validateRequest,
  cancelarCita
);

router.post(
  '/:id/reagendar',
  param('id').isMongoId().withMessage('ID de cita inválido'),
  validarReagendarCita(),
  validateRequest,
  reagendarCita
);

router.post(
  '/:id/confirmar',
  param('id').isMongoId().withMessage('ID de cita inválido'),
  validateRequest,
  confirmarCita
);

router.post(
  '/:id/completar',
  param('id').isMongoId().withMessage('ID de cita inválido'),
  validateRequest,
  completarCita
);


// Ruta para obtener disponibilidad de profesionales
router.get(
  '/disponibilidad/:profesionalId',
  validarObtenerDisponibilidad(),
  validateRequest,
  obtenerDisponibilidadProfesional
);

export default router;
