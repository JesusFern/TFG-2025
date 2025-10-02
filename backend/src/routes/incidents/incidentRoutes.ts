import { Router } from 'express';
import {
  crearIncidencia,
  obtenerTodasLasIncidencias,
  marcarComoResuelta,
  obtenerMisIncidencias,
  eliminarIncidencia,
  asignarIncidencia
} from '../../controllers/incidents/incidentController';
import { authenticateToken, authorizeAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { 
  crearIncidenciaValidator,
  resolverIncidenciaValidator
} from '../../validators/incidentValidators';
import uploadIncidents from '../../config/multerIncidents';

const router = Router();

// Rutas para incidencias

// POST /api/incidents - Crear incidencia (Usuario/Trabajador)
router.post(
  '/',
  authenticateToken,
  uploadIncidents.array('imagenes', 5),
  crearIncidenciaValidator,
  validateRequest,
  crearIncidencia
);

// GET /api/incidents/mis-incidencias - Obtener mis incidencias (Usuario/Trabajador)
router.get(
  '/mis-incidencias',
  authenticateToken,
  obtenerMisIncidencias
);

// GET /api/incidents/admin - Obtener todas las incidencias (Solo Admin)
router.get(
  '/admin',
  authenticateToken,
  authorizeAdmin,
  obtenerTodasLasIncidencias
);

// PUT /api/incidents/:id/marcar-resuelta - Marcar incidencia como resuelta (Solo Admin)
router.put(
  '/:id/marcar-resuelta',
  authenticateToken,
  authorizeAdmin,
  resolverIncidenciaValidator,
  validateRequest,
  marcarComoResuelta
);

// DELETE /api/incidents/:id - Eliminar incidencia (Solo el creador)
router.delete(
  '/:id',
  authenticateToken,
  eliminarIncidencia
);

// PUT /api/incidents/:id/asignar - Asignar incidencia (Solo Admin)
router.put(
  '/:id/asignar',
  authenticateToken,
  authorizeAdmin,
  asignarIncidencia
);

export default router;

