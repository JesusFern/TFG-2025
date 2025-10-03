import { Router } from 'express';
import { UserTrackingController } from '../../controllers/users/userTrackingController';
import { authenticateToken, authorizeWorker } from '../../middlewares/authMiddleware';
import { 
  validateUserTrackingCreate, 
  validateUserTrackingUpdate,
  validateAlMenosUnCampo 
} from '../../validators/userTrackingValidators';
import multerUserTracking from '../../config/multerUserTracking';

const router = Router();

// Rutas para el usuario autenticado
router.get('/me', 
  authenticateToken, 
  UserTrackingController.getMe
);

router.post('/me/guardar', 
  authenticateToken, 
  validateUserTrackingCreate,
  validateAlMenosUnCampo,
  UserTrackingController.guardarSeguimientoCompleto
);

// Rutas para registros específicos
router.put('/:id', 
  authenticateToken, 
  validateUserTrackingUpdate,
  UserTrackingController.updateTracking
);

// Rutas para archivos multimedia
router.post('/:trackingId/archivos', 
  authenticateToken, 
  multerUserTracking.single('archivo'),
  UserTrackingController.uploadArchivoMultimedia
);

router.delete('/:trackingId/archivos/:archivoPath', 
  authenticateToken, 
  UserTrackingController.removeArchivoMultimedia
);

// Rutas para trabajadores
router.get('/cliente/:userId', 
  authenticateToken, 
  authorizeWorker, 
  UserTrackingController.getByUserIdForWorker
);

export default router;