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

console.log('🔧 Configurando rutas de conversaciones...');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);
console.log('  ✅ Middleware de autenticación configurado');

// Middleware de logging para todas las rutas
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('🔍 RUTA ACCEDIDA:', req.method, req.originalUrl);
  console.log('🔍 Parámetros:', req.params);
  console.log('🔍 Query:', req.query);
  next();
});

// Middleware de logging específico para la ruta de conversaciones del usuario
const logConversacionesUsuario = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('🎯 MIDDLEWARE ESPECÍFICO: GET /by-user/:usuarioId');
  console.log('🔍 Parámetros:', req.params);
  console.log('🔍 Query:', req.query);
  console.log('🔍 Usuario autenticado:', req.user);
  console.log('✅ Llamando a next() para ir al controlador');
  next();
};

// Rutas específicas de usuario (deben ir ANTES de las rutas generales)
router.get('/by-user/:usuarioId', logConversacionesUsuario, obtenerConversacionesUsuario);
console.log('  ✅ GET /by-user/:usuarioId configurado');

// Rutas para conversaciones
router.post('/', validarCrearConversacion, crearConversacion);
console.log('  ✅ POST / configurado');

router.get('/', obtenerConversaciones);
console.log('  ✅ GET / configurado');

router.get('/estadisticas', obtenerEstadisticasConversaciones);
console.log('  ✅ GET /estadisticas configurado');

// Rutas generales (deben ir DESPUÉS de las rutas específicas)
router.get('/:id', obtenerConversacionPorId);
console.log('  ✅ GET /:id configurado');

router.put('/:id', actualizarConversacion);
console.log('  ✅ PUT /:id configurado');

router.patch('/:id/archivar', archivarConversacion);
console.log('  ✅ PATCH /:id/archivar configurado');

console.log('🎯 Rutas de conversaciones configuradas correctamente');

export default router;
