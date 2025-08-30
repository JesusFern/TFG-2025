import { Router } from 'express';
import mensajeRoutes from './mensajeRoutes';
import conversacionRoutes from './conversacionRoutes';
import notificacionRoutes from './notificacionRoutes';

const router = Router();

// Prefijo para todas las rutas de mensajería
const prefix = '/api/messaging';

// Rutas de mensajes
router.use(`${prefix}/mensajes`, mensajeRoutes);

// Rutas de conversaciones
router.use(`${prefix}/conversaciones`, conversacionRoutes);

// Rutas de notificaciones
router.use(`${prefix}/notificaciones`, notificacionRoutes);

export default router;
