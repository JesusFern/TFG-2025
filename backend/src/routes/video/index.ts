import { Router } from 'express';
import videoRoutes from './videoRoutes';

const router = Router();

// Rutas de video
router.use('/video', videoRoutes);

export default router;
