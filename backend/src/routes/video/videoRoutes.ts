import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { createUserToken } from '../../controllers/video/videoController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Generar token de usuario para Stream.io
router.post('/token', createUserToken);

export default router;
