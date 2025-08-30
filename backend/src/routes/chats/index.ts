import { Router } from 'express';
import mensajeRoutes from './mensajeRoutes';
import conversacionRoutes from './conversacionRoutes';
import notificacionRoutes from './notificacionRoutes';

const router = Router();

// Rutas de mensajes
router.use('/mensajes', mensajeRoutes);

// Rutas de conversaciones
router.use('/conversaciones', conversacionRoutes);

// Rutas de notificaciones
router.use('/notificaciones', notificacionRoutes);

export default router;
