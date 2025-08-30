import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validarCrearConversacion } from '../../validators/chatValidators';
import { crearConversacion, obtenerConversaciones, obtenerConversacionPorId, actualizarConversacion, archivarConversacion, obtenerConversacionUsuario, obtenerEstadisticasConversaciones } from '../../controllers/chats/conversacionController';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para conversaciones
router.post('/', validarCrearConversacion, crearConversacion);
router.get('/', obtenerConversaciones);
router.get('/estadisticas', obtenerEstadisticasConversaciones);
router.get('/usuario/:otroUsuarioId', obtenerConversacionUsuario);
router.get('/:id', obtenerConversacionPorId);
router.put('/:id', actualizarConversacion);
router.patch('/:id/archivar', archivarConversacion);

export default router;
