import { Router } from 'express';
import citaRoutes from './citaRoutes';

const router = Router();

// Montar las rutas de citas
router.use('/citas', citaRoutes);

export default router;
