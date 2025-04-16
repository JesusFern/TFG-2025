import { Router } from 'express';
import { createUser, loginUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeUserOrAdmin } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { loginValidator, createUserValidator, updateUserValidator } from '../validators/userValidators';

const router = Router();

// Rutas públicas
router.post('/users', createUserValidator, validateRequest, createUser);
router.post('/login', loginValidator, validateRequest, loginUser);

// Rutas protegidas
router.get('/users', authenticateToken, getUsers);
router.get('/users/:id', authenticateToken, validateRequest, getUserById);
router.put('/users/:id', authenticateToken, authorizeUserOrAdmin, updateUserValidator, validateRequest, updateUser);
router.delete('/users/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, deleteUser);

export default router;