import { Response, Request } from 'express';
import { SuscriptionPlanService } from '../../service/suscriptionPlan/suscriptionPlanService';
import { AuthenticatedRequest } from '../../types';
import { verificarAutenticacion } from '../../validators/commonValidators';
import mongoose from 'mongoose';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';
import Payment from '../../models/payments/payment';
import logger from '../../utils/logger';

export class SuscriptionPlanController {
  static async getPlansWithUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      const plans = await SuscriptionPlan.find({}).sort({ precioMensual: 1 }).lean();
      
      let userCurrentPlan: {_id: mongoose.Types.ObjectId | string} | null = null;
      if (userId) {
        const userIdObjectId = mongoose.Types.ObjectId.isValid(userId) 
          ? new mongoose.Types.ObjectId(userId) 
          : userId;
          
        const userSuscription = await UserSuscription.findOne({ 
          userId: userIdObjectId
        }).populate('planId').lean();
        
        if (userSuscription && userSuscription.planId) {
          userCurrentPlan = userSuscription.planId as {_id: mongoose.Types.ObjectId | string};
        }
      }
      
      const plansWithStatus = plans.map(plan => {
        const isUserSubscribed = userCurrentPlan && plan._id ? 
          userCurrentPlan._id.toString() === plan._id.toString() : 
          false;
        
        return {
          ...plan,
          isUserSubscribed
        };
      });
      
      res.status(200).json({
        success: true,
        data: {
          plans: plansWithStatus,
          userCurrentPlan
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async getAllPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await SuscriptionPlan.find({});
      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async getPlansByPriceType(req: Request, res: Response): Promise<void> {
    try {
      const { tipoPrecio } = req.params;
      
      if (tipoPrecio !== 'Pro') {
        res.status(400).json({
          success: false,
          message: 'Tipo de precio no válido. Solo se permite Pro'
        });
        return;
      }
      
      const plans = await SuscriptionPlan.find({ tipoPrecio });
      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async getPlansByPlanType(req: Request, res: Response): Promise<void> {
    try {
      const { tipoPlan } = req.params;
      
      if (!['Individual', 'Familiar', 'Profesional'].includes(tipoPlan)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de plan no válido. Debe ser Individual, Familiar o Profesional'
        });
        return;
      }
      
      const plans = await SuscriptionPlan.find({ tipoPlan });
      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de plan no válido'
        });
        return;
      }
      
      const plan = await SuscriptionPlan.findById(id);
      
      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async subscribeToPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { planId, frecuenciaPago } = req.body;
      const { user } = req;
      
      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!planId || !frecuenciaPago) {
        res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere planId y frecuenciaPago'
        });
        return;
      }

      // Validar frecuencia de pago
      if (!['mensual', 'trimestral', 'anual'].includes(frecuenciaPago)) {
        res.status(400).json({
          success: false,
          message: 'Frecuencia de pago no válida. Debe ser mensual, trimestral o anual'
        });
        return;
      }
      
      // URLs para redirección después del pago (apuntar al frontend)
      const frontendUrl = process.env.FRONTEND_URL;
      
      const successUrl = `${frontendUrl}/payment/confirm?sessionId={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${frontendUrl}/payment/cancel`;
      
      
      const result = await SuscriptionPlanService.createSubscriptionPayment(
        user.id,
        planId,
        frecuenciaPago as 'mensual' | 'trimestral' | 'anual',
        successUrl,
        cancelUrl
      );
      
      
      // Para suscripciones de pago, devolver la URL de checkout de Stripe
      res.status(200).json({
        success: true,
        sessionId: result.sessionId,
        checkoutUrl: result.url
      });
      return;
      
    } catch (error: unknown) {
      console.error('Error al suscribirse al plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(400).json({
        success: false,
        message: errorMessage
      });
      return;
    }
  }

  static async upgradeSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { planId, frecuenciaPago } = req.body;
      const { user } = req;
      
      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!planId || !frecuenciaPago) {
        res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere planId y frecuenciaPago'
        });
        return;
      }

      // Validar frecuencia de pago
      if (!['mensual', 'trimestral', 'anual'].includes(frecuenciaPago)) {
        res.status(400).json({
          success: false,
          message: 'Frecuencia de pago no válida. Debe ser mensual, trimestral o anual'
        });
        return;
      }

      const successUrl = `${process.env.FRONTEND_URL}/planes-suscripcion?success=true&upgrade=true`;
      const cancelUrl = `${process.env.FRONTEND_URL}/planes-suscripcion?canceled=true`;
      
      const result = await SuscriptionPlanService.createUpgradeCheckoutSession(
        user.id,
        planId,
        frecuenciaPago as 'mensual' | 'trimestral' | 'anual',
        successUrl,
        cancelUrl
      );
      
      res.status(200).json({
        success: true,
        sessionId: result.sessionId,
        checkoutUrl: result.url
      });
      
    } catch (error: unknown) {
      console.error('Error al hacer upgrade de suscripción:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async debugPayments(req: Request, res: Response): Promise<void> {
    try {
      const payments = await Payment.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'email')
        .populate('suscriptionPlanId', 'nombre tipoPlan');
      
      res.status(200).json({
        success: true,
        payments: payments.map(p => ({
          id: p._id,
          userId: p.userId,
          planId: p.suscriptionPlanId,
          stripeSessionId: p.stripeSessionId,
          status: p.status,
          amount: p.amount,
          metadata: p.metadata,
          createdAt: new Date()
        }))
      });
    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async getRenewalHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;

      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Buscar suscripción del usuario
      const UserSuscription = (await import('../../models/suscriptionPlans/userSuscription')).default;
      const userSubscription = await UserSuscription.findOne({ 
        userId: new mongoose.Types.ObjectId(user.id),
      }).populate('planId', 'nombre tipoPlan');

      if (!userSubscription) {
        res.status(404).json({
          success: false,
          message: 'No se encontró suscripción recurrente'
        });
        return;
      }

      // Buscar pagos relacionados
      const Payment = (await import('../../models/payments/payment')).default;
      const payments = await Payment.find({
        userId: new mongoose.Types.ObjectId(user.id),
        stripeSubscriptionId: userSubscription.stripeSubscriptionId
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        subscription: {
          id: userSubscription._id,
          plan: userSubscription.planId,
          fechaInicio: userSubscription.fechaInicio,
          fechaFin: userSubscription.fechaFin,
          fechaProximoPago: userSubscription.fechaProximoPago,
          estadoPago: userSubscription.estadoPago,
          stripeSubscriptionId: userSubscription.stripeSubscriptionId
        },
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentDate: payment.paymentDate,
          createdAt: (payment as unknown as { createdAt: Date }).createdAt,
          frecuenciaPago: payment.frecuenciaPago
        })),
        renewalInfo: {
          totalPayments: payments.length,
          lastPayment: payments[0]?.paymentDate || null,
          nextPayment: userSubscription.fechaProximoPago,
          isActive: userSubscription.fechaFin > new Date() && userSubscription.estadoPago === 'pagado'
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de renovaciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async simulateRenewal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;

      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Solo permitir en desarrollo
      if (process.env.NODE_ENV !== 'development') {
        res.status(403).json({
          success: false,
          message: 'Esta función solo está disponible en desarrollo'
        });
        return;
      }

      // Buscar suscripción activa del usuario
      const UserSuscription = (await import('../../models/suscriptionPlans/userSuscription')).default;
      const userSubscription = await UserSuscription.findOne({ 
        userId: new mongoose.Types.ObjectId(user.id),
      });

      if (!userSubscription) {
        res.status(404).json({
          success: false,
          message: 'No se encontró suscripción recurrente activa'
        });
        return;
      }

      console.log('Simulando renovación para suscripción:', userSubscription._id);
      
      // Simular renovación
      await userSubscription.renovarSuscripcion();
      
      console.log('Renovación simulada exitosamente:', userSubscription._id);

      res.status(200).json({
        success: true,
        message: 'Renovación simulada exitosamente',
        subscription: {
          id: userSubscription._id,
          fechaInicio: userSubscription.fechaInicio,
          fechaFin: userSubscription.fechaFin,
          fechaProximoPago: userSubscription.fechaProximoPago,
          estadoPago: userSubscription.estadoPago
        }
      });

    } catch (error) {
      console.error('Error simulando renovación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async processPendingUpgrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;

      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Buscar cambios pendientes del usuario autenticado
      const pendingUpgrades = await Payment.find({
        userId: user.id,
        status: 'pending',
        'metadata.isChange': 'true'
      }).sort({ createdAt: -1 }); // Más recientes primero

      console.log(`Encontrados ${pendingUpgrades.length} cambios pendientes para usuario ${user.id}`);

      if (pendingUpgrades.length === 0) {
        res.status(200).json({
          success: true,
          message: 'No hay cambios pendientes para procesar',
          results: []
        });
        return;
      }

      const results = [];

      for (const payment of pendingUpgrades) {
        try {
          console.log(`Procesando upgrade pendiente: ${payment._id} para usuario ${user.id}`);
          
          // Verificar que el plan existe
          const plan = await SuscriptionPlan.findById(payment.suscriptionPlanId);
          if (!plan) {
            console.error(`Plan no encontrado: ${payment.suscriptionPlanId}`);
            results.push({
              paymentId: payment._id,
              success: false,
              error: 'Plan de suscripción no encontrado'
            });
            continue;
          }

          // Marcar como completado
          payment.status = 'completed';
          payment.paymentDate = new Date();
          await payment.save();

          // Procesar la suscripción
          const subscription = await SuscriptionPlanService.confirmPayment(payment.stripeSessionId);
          
          results.push({
            paymentId: payment._id,
            success: true,
            subscriptionId: subscription._id,
            planName: plan.nombre
          });

          console.log(`Upgrade procesado exitosamente: ${payment._id} -> Plan: ${plan.nombre}`);
        } catch (error) {
          console.error(`Error procesando upgrade ${payment._id}:`, error);
          results.push({
            paymentId: payment._id,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      res.status(200).json({
        success: true,
        message: `Procesados ${successCount} upgrades exitosamente, ${failCount} fallaron`,
        results
      });

    } catch (error) {
      console.error('Error procesando upgrades pendientes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'ID de sesión no proporcionado o inválido'
        });
        return;
      }
      
      console.log('Confirmando pago para sesión:', sessionId);
      
      // Buscar el pago por sessionId
      const payment = await Payment.findOne({ 
        stripeSessionId: sessionId
      });
      
      if (!payment) {
        console.error('Pago no encontrado para sesión:', sessionId);
        console.log('Buscando todos los pagos con sessionId similar...');
        const similarPayments = await Payment.find({ 
          stripeSessionId: { $regex: sessionId.substring(0, 20), $options: 'i' }
        });
        console.log('Pagos similares encontrados:', similarPayments.length);
        similarPayments.forEach(p => {
          console.log(`- ${p._id}: ${p.stripeSessionId} (${p.status})`);
        });
        
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }
      
      console.log('Pago encontrado:', payment._id, 'Estado:', payment.status, 'Metadata:', payment.metadata);
      
      // Usar el userId del pago para buscar la suscripción
      const userId = payment.userId;
      
      // Si el pago ya está completado, devolver éxito
      if (payment.status === 'completed') {
        const subscription = await UserSuscription.findOne({ userId })
          .populate('planId');
        
        res.status(200).json({
          success: true,
          message: 'El pago ya ha sido confirmado anteriormente',
          subscription
        });
        return;
      }
      
      // Si el pago está pendiente, confirmar manualmente
      if (payment.status === 'pending') {
        console.log('Procesando pago pendiente:', payment._id);
        
        // Actualizar el estado del pago
        payment.status = 'completed';
        payment.paymentDate = new Date();
        await payment.save();
        
        console.log('Pago marcado como completado, procesando suscripción...');
        
        // Procesar la suscripción
        const subscription = await SuscriptionPlanService.confirmPayment(sessionId);
        
        console.log('Suscripción procesada exitosamente:', subscription._id);
        
        res.status(200).json({
          success: true,
          message: 'Pago confirmado correctamente',
          subscription
        });
        return;
      }
      
      // Si el pago falló, informar al usuario
      res.status(400).json({
        success: false,
        message: `No se puede confirmar el pago, estado actual: ${payment.status}`
      });
      
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }
  
  static async checkPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { user } = req;
      
      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      // Verificar que el pago existe y pertenece al usuario
      const payment = await Payment.findOne({ 
        stripeSessionId: sessionId,
        userId: user.id
      });
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado o no pertenece al usuario'
        });
        return;
      }
      
      // En desarrollo, verificar el estado directamente en Stripe
      if (process.env.NODE_ENV === 'development') {
        const stripeStatus = await SuscriptionPlanService.checkStripePaymentStatus(sessionId);
        if (stripeStatus.success && stripeStatus.status === 'completed' && payment.status !== 'completed') {
          // El pago se completó en Stripe pero no se actualizó localmente
          payment.status = 'completed';
          payment.paymentDate = new Date();
          await payment.save();
          
          // Crear la suscripción si no existe
          await SuscriptionPlanService.confirmPayment(sessionId);
        }
      }
      
      // Devolver el estado del pago
      res.status(200).json({
        success: true,
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentDate: payment.paymentDate,
          // Omitimos createdAt para evitar problemas de tipo, el cliente puede usar la fecha de creación desde _id
        }
      });
      
    } catch (error) {
      console.error('Error al verificar el estado del pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }
  
  static async getUserSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;
      
      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      // Validar que el userId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(user.id)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario no válido'
        });
        return;
      }
      
      // Convertir el string ID a ObjectId
      const userId = new mongoose.Types.ObjectId(user.id);
      
      // Buscar la suscripción del usuario
      const subscription = await UserSuscription.findOne({ userId })
        .populate('planId');
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'No tienes ninguna suscripción activa'
        });
        return;
      }
      
      // Verificar si la suscripción ha expirado
      const now = new Date();
      if (subscription.fechaFin < now) {
        res.status(200).json({
          success: true,
          subscription,
          status: 'expirada',
          message: 'Tu suscripción ha expirado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        subscription,
        status: 'activa',
        message: 'Suscripción activa'
      });
      
    } catch (error) {
      console.error('Error al obtener la suscripción del usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Obtener el estado de suscripción del usuario
   * GET /api/suscription-plans/status
   */
  static async getSuscriptionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'obtener estado de suscripción');
      if (!userId) return;

      // Buscar la suscripción del usuario
      const suscription = await UserSuscription.findOne({ userId })
        .populate('planId', 'nombre descripcion tipoPrecio tipoPlan precioMensual precioTrimestral precioAnual beneficios');

      if (!suscription) {
        res.status(200).json({
          hasSuscription: false,
          canAccessNutrition: false,
          canAccessTraining: false,
          message: 'No tienes un plan de suscripción activo. Suscríbete para acceder al progreso de nutrición y entrenamiento.'
        });
        return;
      }

      // Verificar si la suscripción está activa
      const isActive = suscription.isActive();
      
      // Determinar qué servicios puede acceder según el tipo de plan
      let canAccessNutrition = false;
      let canAccessTraining = false;
      let message = '';

      if (isActive) {
        const plan = suscription.planId as unknown as { tipoPlan?: string; tipoPrecio?: string }; // El populate debería haber cargado el plan
        
        logger.info('Plan data:', { plan, tipoPlan: plan?.tipoPlan, tipoPrecio: plan?.tipoPrecio });
        
        if (plan?.tipoPlan === 'Nutricion') {
          canAccessNutrition = true;
          message = 'Tienes acceso al progreso de nutrición.';
        } else if (plan?.tipoPlan === 'Entrenamiento personal') {
          canAccessTraining = true;
          message = 'Tienes acceso al progreso de entrenamiento personal.';
        } else if (plan?.tipoPlan === 'Nutrición y entrenamiento personal') {
          canAccessNutrition = true;
          canAccessTraining = true;
          message = 'Tienes acceso completo al progreso de nutrición y entrenamiento personal.';
        }
      } else {
        message = 'Tu suscripción ha expirado. Renueva tu plan para continuar accediendo al progreso.';
      }

      logger.info('Estado de suscripción obtenido', {
        userId,
        hasSuscription: true,
        isActive,
        canAccessNutrition,
        canAccessTraining,
        planType: suscription.planId ? (suscription.planId as unknown as { tipoPlan: string }).tipoPlan : 'N/A'
      });

      res.status(200).json({
        hasSuscription: true,
        suscription: {
          _id: suscription._id,
          userId: suscription.userId,
          planId: suscription.planId._id,
          plan: suscription.planId,
          fechaInicio: suscription.fechaInicio,
          fechaFin: suscription.fechaFin,
          frecuenciaDePago: suscription.frecuenciaDePago,
          estadoPago: suscription.estadoPago,
          fechaProximoPago: suscription.fechaProximoPago,
          isActive
        },
        canAccessNutrition,
        canAccessTraining,
        message
      });
    } catch (error) {
      logger.error('Error al obtener estado de suscripción', {
        error: error instanceof Error ? error.message : String(error),
        userId: req.user?.id
      });

      res.status(500).json({ 
        message: 'Error interno del servidor al obtener estado de suscripción' 
      });
    }
  }
}
