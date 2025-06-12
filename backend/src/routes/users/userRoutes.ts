import { Router } from 'express';
import { registerUser, loginUser, getUsers, getUserById, updateUser, deleteUser } from '../../controllers/users/userController';
import { authenticateToken, authorizeUserOrAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { loginValidator, createUserValidator, updateUserValidator } from '../../validators/userValidators';

const router = Router();

// Rutas públicas
router.post('/register', createUserValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);

// Rutas protegidas
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, validateRequest, getUserById);
router.put('/:id', authenticateToken, authorizeUserOrAdmin, updateUserValidator, validateRequest, updateUser);
router.delete('/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, deleteUser);

export default router;