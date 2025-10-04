import express from 'express';
import { Response, NextFunction } from 'express';
import { SuscriptionPlanController } from '../../controllers/suscriptionPlans/suscriptionPlanController';
import { validateSubscriptionRequest } from '../../validators/suscriptionPlanValidators';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validationMiddleware';
import { AuthenticatedRequest } from '../../types';

const router = express.Router();

// Middleware de autorización específico para esta ruta
const authorizeUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  if (!user || user.role !== 'user') {
    res.status(403).json({ 
      success: false,
      message: 'No tienes permiso para realizar esta acción' 
    });
    return;
  }
  
  next();
};


// Rutas públicas para ver planes
router.get('/', SuscriptionPlanController.getAllPlans);
router.get('/with-user-status', authenticateToken, SuscriptionPlanController.getPlansWithUserStatus);
router.get('/by-price/:tipoPrecio', SuscriptionPlanController.getPlansByPriceType);
router.get('/by-plan/:tipoPlan', SuscriptionPlanController.getPlansByPlanType);

// Rutas protegidas que requieren autenticación
router.put(
  '/subscribe', 
  authenticateToken, 
  authorizeUser,
  validateSubscriptionRequest,
  validateRequest,
  SuscriptionPlanController.subscribeToPlan
);

router.put(
  '/upgrade', 
  authenticateToken, 
  authorizeUser,
  validateSubscriptionRequest,
  validateRequest,
  SuscriptionPlanController.upgradeSubscription
);

// Ruta para procesar upgrades pendientes (para debugging)
router.post(
  '/process-pending-upgrades',
  authenticateToken,
  authorizeUser,
  SuscriptionPlanController.processPendingUpgrades
);

// Ruta para simular renovación (solo desarrollo)
router.post(
  '/simulate-renewal',
  authenticateToken,
  authorizeUser,
  SuscriptionPlanController.simulateRenewal
);

// Ruta para obtener historial de renovaciones
router.get(
  '/renewal-history',
  authenticateToken,
  authorizeUser,
  SuscriptionPlanController.getRenewalHistory
);

// Ruta temporal para debug de pagos
router.get('/debug-payments', SuscriptionPlanController.debugPayments);

// Ruta para confirmar pagos después de completarlos en Stripe
// Esta ruta debe ser pública ya que es un callback de Stripe
router.get(
  '/payment/confirm', 
  SuscriptionPlanController.confirmPayment
);

// Ruta para verificar el estado de un pago
router.get(
  '/payment/status/:sessionId', 
  authenticateToken, 
  authorizeUser,
  SuscriptionPlanController.checkPaymentStatus
);

// Ruta para obtener la suscripción actual del usuario
router.get(
  '/my-subscription', 
  authenticateToken, 
  authorizeUser,
  SuscriptionPlanController.getUserSubscription
);

// Ruta para obtener el estado de suscripción (para verificar acceso a funcionalidades)
router.get(
  '/status', 
  authenticateToken, 
  SuscriptionPlanController.getSuscriptionStatus
);

// Ruta para obtener un plan por ID (debe ir al final para no interferir con rutas específicas)
router.get('/:id', SuscriptionPlanController.getPlanById);

export default router;
