import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validarCrearMensaje, validarObtenerMensajes } from '../../validators/chatValidators';
import { crearMensaje, obtenerMensajes, obtenerMensajePorId, marcarComoLeido, eliminarMensaje, obtenerMensajesNoLeidos } from '../../controllers/chats/mensajeController';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para mensajes
router.post('/', validarCrearMensaje, crearMensaje);
router.get('/', validarObtenerMensajes, obtenerMensajes);
router.get('/no-leidos', obtenerMensajesNoLeidos);
router.get('/:id', obtenerMensajePorId);
router.patch('/:id/leer', marcarComoLeido);
router.delete('/:id', eliminarMensaje);

export default router;
