import { Router } from 'express';
import mensajeRoutes from './mensajeRoutes';
import conversacionRoutes from './conversacionRoutes';
import notificacionRoutes from './notificacionRoutes';

const router = Router();

 

// Rutas de mensajería
router.use('/mensajes', mensajeRoutes);
router.use('/conversaciones', conversacionRoutes);
router.use('/notificaciones', notificacionRoutes);

 

export default router;
