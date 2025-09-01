import { Router } from 'express';
import ejercicioRoutes from './ejercicioRoutes';
import planEntrenamientoRoutes from './planEntrenamientoRoutes';
import sesionRoutes from './sesionRoutes';

const router = Router();

// Prefijo para todas las rutas de entrenamiento
router.use('/ejercicios', ejercicioRoutes);
router.use('/planes', planEntrenamientoRoutes);
router.use('/sesiones', sesionRoutes);

export default router;
