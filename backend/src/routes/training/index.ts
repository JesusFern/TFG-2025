import { Router } from 'express';
import ejercicioRoutes from './ejercicioRoutes';
import planEntrenamientoRoutes from './planEntrenamientoRoutes';
import sesionRoutes from './sesionRoutes';
import registroEjercicioRoutes from './registroEjercicioRoutes';

const router = Router();

// Prefijo para todas las rutas de entrenamiento
router.use('/ejercicios', ejercicioRoutes);
router.use('/planes', planEntrenamientoRoutes);
router.use('/sesiones', sesionRoutes);
router.use('/registros', registroEjercicioRoutes);

export default router;
