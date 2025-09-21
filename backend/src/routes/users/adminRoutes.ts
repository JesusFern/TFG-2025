import { Router } from 'express';
import { getUsers, getUserById, getWorkers, getWorkerById, registerWorker } from '../../controllers/users/adminController';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { authorizeAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { validateWorkerRegistration } from '../../validators/workerValidators';

const router = Router();

// Rutas de gestión de usuarios (requieren autenticación y autorización de admin)
router.get('/users', authenticateToken, authorizeAdmin, getUsers);
router.get('/users/:id', authenticateToken, authorizeAdmin, getUserById);

// Rutas de gestión de trabajadores (requieren autenticación y autorización de admin)
router.post('/workers/register', authenticateToken, authorizeAdmin, validateWorkerRegistration, validateRequest, registerWorker);
router.get('/workers', authenticateToken, authorizeAdmin, getWorkers);
router.get('/workers/:id', authenticateToken, authorizeAdmin, getWorkerById);

export default router;
