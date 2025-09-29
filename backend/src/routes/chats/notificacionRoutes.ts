import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import {
  obtenerNotificaciones,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionPorId,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  obtenerEstadisticas
} from '../../controllers/chats/notificacionController';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @route GET /api/notificaciones
 * @desc Obtener notificaciones del usuario con filtros
 * @access Private
 * @query limit, offset, tipo, prioridad, leida, orden
 */
router.get('/', obtenerNotificaciones);

/**
 * @route GET /api/notificaciones/no-leidas
 * @desc Obtener notificaciones no leídas del usuario
 * @access Private
 * @query limit
 */
router.get('/no-leidas', obtenerNotificacionesNoLeidas);

/**
 * @route GET /api/notificaciones/estadisticas
 * @desc Obtener estadísticas de notificaciones del usuario
 * @access Private
 */
router.get('/estadisticas', obtenerEstadisticas);

/**
 * @route GET /api/notificaciones/:id
 * @desc Obtener una notificación específica por ID
 * @access Private
 */
router.get('/:id', obtenerNotificacionPorId);

/**
 * @route PUT /api/notificaciones/:id/leer
 * @desc Marcar una notificación como leída
 * @access Private
 */
router.put('/:id/leer', marcarComoLeida);

/**
 * @route PUT /api/notificaciones/leer-todas
 * @desc Marcar todas las notificaciones como leídas
 * @access Private
 */
router.put('/leer-todas', marcarTodasComoLeidas);

/**
 * @route DELETE /api/notificaciones/:id
 * @desc Eliminar una notificación
 * @access Private
 */
router.delete('/:id', eliminarNotificacion);

export default router;