import { Router } from 'express';
import { createUser, loginUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeUserOrAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/users', createUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/users', getUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.put('/users/:id', authenticateToken, authorizeUserOrAdmin, updateUser);
router.delete('/users/:id', authenticateToken, authorizeUserOrAdmin, deleteUser);

export default router;