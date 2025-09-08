import { Router, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validarCrearConversacion } from '../../validators/chatValidators';
import { 
  crearConversacion, 
  obtenerConversaciones, 
  obtenerConversacionPorId, 
  actualizarConversacion, 
  archivarConversacion, 
  obtenerEstadisticasConversaciones, 
  obtenerConversacionesUsuario 
} from '../../controllers/chats/conversacionController';
import { AuthenticatedRequest } from '../../types';

const router = Router();

 

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Middleware de logging para todas las rutas
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  next();
});

// Middleware de logging específico para la ruta de conversaciones del usuario
const logConversacionesUsuario = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  next();
};

// Rutas específicas de usuario (deben ir ANTES de las rutas generales)
router.get('/by-user/:usuarioId', logConversacionesUsuario, obtenerConversacionesUsuario);

// Rutas para conversaciones
router.post('/', validarCrearConversacion, crearConversacion);
router.get('/', obtenerConversaciones);
router.get('/estadisticas', obtenerEstadisticasConversaciones);

// Rutas generales
router.get('/:id', obtenerConversacionPorId);
router.put('/:id', actualizarConversacion);
router.patch('/:id/archivar', archivarConversacion);

 

export default router;
