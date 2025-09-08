import { Router, Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadProfilePhoto,
  assignWorker
} from '../../controllers/users/userController';
import { authenticateToken, authorizeUserOrAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { 
  loginValidator, 
  registerValidator,
  step0Validator,
  step1Validator,
  step2Validator,
  step3Validator,
  step4Validator,
  assignWorkerValidator
} from '../../validators/userValidators';

const router = Router();

// Rutas públicas
router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/validate-step/0', step0Validator, validateRequest, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Validación del paso 0 exitosa' });
});
router.post('/validate-step/1', step1Validator, validateRequest, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Validación del paso 1 exitosa' });
});
router.post('/validate-step/2', step2Validator, validateRequest, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Validación del paso 2 exitosa' });
});
router.post('/validate-step/3', step3Validator, validateRequest, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Validación del paso 3 exitosa' });
});
router.post('/validate-step/4', step4Validator, validateRequest, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Validación del paso 4 exitosa' });
});
router.post('/login', loginValidator, validateRequest, loginUser);

// Rutas protegidas para el usuario autenticado
router.get('/me', authenticateToken, getMyProfile);
router.put('/me', authenticateToken, updateMyProfile);
router.patch('/me/password', authenticateToken, changeMyPassword);
router.patch('/me/photo', authenticateToken, uploadProfilePhoto);


router.post('/assign-worker', authenticateToken, assignWorkerValidator, validateRequest, assignWorker);

// Rutas protegidas para administradores
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, validateRequest, getUserById);
router.put('/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, updateUser);
router.delete('/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, deleteUser);

export default router;