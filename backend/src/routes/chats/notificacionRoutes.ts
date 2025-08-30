import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validarObtenerNotificaciones } from '../../validators/chatValidators';
import { crearNotificacion, obtenerNotificaciones, obtenerNotificacionPorId, marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion, obtenerNotificacionesSistema, obtenerNotificacionesNoLeidas } from '../../controllers/chats/notificacionController';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para notificaciones
router.post('/', crearNotificacion);
router.get('/', validarObtenerNotificaciones, obtenerNotificaciones);
router.get('/no-leidas', obtenerNotificacionesNoLeidas);
router.get('/sistema', obtenerNotificacionesSistema);
router.get('/:id', obtenerNotificacionPorId);
router.patch('/:id/leer', marcarComoLeida);
router.patch('/leer-todas', marcarTodasComoLeidas);
router.delete('/:id', eliminarNotificacion);

export default router;
