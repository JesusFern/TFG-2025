import { Router } from 'express';
import { authenticateToken, authorizeWorker, authorizeUserWithValidSubscriptionForWorker } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import {
  createAssignmentRequestValidation,
  updateAssignmentRequestStatusValidation,
  cancelAssignmentRequestValidation
} from '../../validators/assignmentRequestValidators';
import {
  createAssignmentRequest,
  getAssignmentRequestsByUser,
  getAssignmentRequestsByWorker,
  getPendingAssignmentRequestsByWorker,
  updateAssignmentRequestStatus,
  cancelAssignmentRequest
} from '../../controllers/assignmentRequests/assignmentRequestController';

const router = Router();

// Ruta para crear una solicitud de asignación (solo usuarios) - Solo en producción, no en tests
if (process.env.NODE_ENV !== 'test') {
  router.post(
    '/',
    authenticateToken,
    authorizeUserWithValidSubscriptionForWorker,
    createAssignmentRequestValidation,
    validateRequest,
    createAssignmentRequest
  );
}

// Ruta para obtener las solicitudes de asignación del usuario autenticado
router.get(
  '/my-requests',
  authenticateToken,
  getAssignmentRequestsByUser
);

// Ruta para obtener las solicitudes de asignación dirigidas al trabajador autenticado
router.get(
  '/worker-requests',
  authenticateToken,
  authorizeWorker,
  getAssignmentRequestsByWorker
);

// Ruta para obtener solo las solicitudes pendientes del trabajador autenticado
router.get(
  '/worker-requests/pending',
  authenticateToken,
  authorizeWorker,
  getPendingAssignmentRequestsByWorker
);

// Ruta para que un trabajador actualice el estado de una solicitud (aceptar/rechazar)
router.patch(
  '/:requestId/status',
  authenticateToken,
  authorizeWorker,
  updateAssignmentRequestStatusValidation,
  validateRequest,
  updateAssignmentRequestStatus
);

// Ruta para que un usuario cancele su propia solicitud
router.delete(
  '/:requestId',
  authenticateToken,
  cancelAssignmentRequestValidation,
  validateRequest,
  cancelAssignmentRequest
);

export default router;
