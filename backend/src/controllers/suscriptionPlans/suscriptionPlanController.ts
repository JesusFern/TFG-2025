import { Response, Request } from 'express';
import { SuscriptionPlanService } from '../../service/suscriptionPlan/suscriptionPlanService';
import { AuthenticatedRequest } from '../../types';
import mongoose from 'mongoose';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';
import Payment from '../../models/payments/payment';

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
      
      if (!['Gratuito', 'Básico', 'Premium'].includes(tipoPrecio)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de precio no válido. Debe ser Gratuito, Básico o Premium'
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
      
      // Si es una suscripción gratuita, devolver directamente
      if (result.freeSubscription) {
        res.status(200).json({
          success: true,
          message: 'Suscripción gratuita activada correctamente',
          redirect: result.redirect
        });
        return;
      }
      
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
      
      // Buscar el pago por sessionId
      const payment = await Payment.findOne({ 
        stripeSessionId: sessionId
      });
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }
      
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
        // Actualizar el estado del pago
        payment.status = 'completed';
        payment.paymentDate = new Date();
        await payment.save();
        
        // Crear la suscripción
        const subscription = await SuscriptionPlanService.confirmPayment(sessionId);
        
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
}
