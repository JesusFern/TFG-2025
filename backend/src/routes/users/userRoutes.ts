import { Router, Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  updateUser, 
  deleteUser,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadProfilePhoto,
  getTrabajadoresRol,
  getAllAvailableWorkers,
  getWorkersAssignedToClient,
  getClientsAssignedToWorker,
  getMyClientsAssigned,
  checkUserSubscriptionStatus,
  getUserById
} from '../../controllers/users/userController';
import { WorkerController } from '../../controllers/workers/workerController';
import { authenticateToken, authorizeUserOrAdmin, authorizeUserWithValidSubscription } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { 
  loginValidator, 
  registerValidator,
  step0Validator,
  step1Validator,
  step2Validator,
  step3Validator,
  step4Validator
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

// Rutas para gestión de trabajadores (disponibles en desarrollo y producción, no en tests)
if (process.env.NODE_ENV !== 'test') {
  router.get('/workers/available', getAllAvailableWorkers);
  router.get('/workers/assigned/:clienteId', authenticateToken, getWorkersAssignedToClient);
  router.get('/clients/assigned/me', authenticateToken, getMyClientsAssigned);
  router.get('/clients/assigned/:workerId', authenticateToken, getClientsAssignedToWorker);
  router.get('/available-workers-by-my-suscription', authenticateToken, authorizeUserWithValidSubscription, validateRequest, getTrabajadoresRol);
  router.get('/subscription-status', authenticateToken, checkUserSubscriptionStatus);
}

// Rutas protegidas para usuarios
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, updateUser);
router.delete('/:id', authenticateToken, authorizeUserOrAdmin, validateRequest, deleteUser);

// Rutas para trabajadores
router.get('/workers/estadisticas-nutricionales/:clienteId', authenticateToken, WorkerController.getEstadisticasNutricionalesCliente);
router.get('/workers/estadisticas-entrenamiento/:clienteId', authenticateToken, WorkerController.getEstadisticasEntrenamientoCliente);

export default router;