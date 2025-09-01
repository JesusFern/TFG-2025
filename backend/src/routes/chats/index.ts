import { Router } from 'express';
import mensajeRoutes from './mensajeRoutes';
import conversacionRoutes from './conversacionRoutes';
import notificacionRoutes from './notificacionRoutes';

const router = Router();

console.log('🔧 Configurando rutas de chat...');

// Rutas de mensajes
router.use('/mensajes', mensajeRoutes);
console.log('  ✅ /mensajes configurado');

// Rutas de conversaciones
router.use('/conversaciones', conversacionRoutes);
console.log('  ✅ /conversaciones configurado');
console.log('    - Ruta específica: GET /conversaciones/by-user/:usuarioId');

// Rutas de notificaciones
router.use('/notificaciones', notificacionRoutes);
console.log('  ✅ /notificaciones configurado');

console.log('🎯 Rutas de chat configuradas correctamente');

export default router;
