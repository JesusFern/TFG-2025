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
  updateAssignmentRequestStatus,
  cancelAssignmentRequest,
  getRequestsByRole,
  checkAssignmentAvailability
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

router.get(
  '/requests',
  authenticateToken,
  getRequestsByRole
);

// Ruta para verificar disponibilidad de asignación para un trabajador específico
router.get(
  '/check-availability/:workerId',
  authenticateToken,
  checkAssignmentAvailability
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
