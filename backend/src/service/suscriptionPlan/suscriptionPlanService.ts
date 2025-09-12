import mongoose from 'mongoose';
import stripe from '../../config/stripe';
import User from '../../models/users/user';
import SuscriptionPlan from '../../models/suscriptionPlans/suscriptionPlan';
import Payment from '../../models/payments/payment';
import UserSuscription from '../../models/suscriptionPlans/userSuscription';

export class SuscriptionPlanService {
  /**
   * Crea una sesión de pago en Stripe y registra el intento de pago
   */
  static async createSubscriptionPayment(
    userId: string,
    planId: string,
    frecuenciaPago: 'mensual' | 'trimestral' | 'anual',
    successUrl: string,
    cancelUrl: string
  ) {
    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(planId)) {
      throw new Error('IDs no válidos');
    }

    // Obtener usuario y plan
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.role !== 'user') {
      throw new Error('Solo los usuarios pueden adquirir planes de suscripción');
    }

    const plan = await SuscriptionPlan.findById(planId);
    if (!plan) {
      throw new Error('Plan de suscripción no encontrado');
    }

    if (plan.tipoPrecio === 'Gratuito') {
      // Para el plan gratuito, no necesitamos procesar pago
      await this.createFreeSubscription(userId, planId);
      return { success: true, redirect: successUrl, freeSubscription: true };
    }

    // Determinar el precio según la frecuencia de pago
    let amount = 0;
    switch (frecuenciaPago) {
      case 'mensual':
        amount = plan.precioMensual;
        break;
      case 'trimestral':
        amount = plan.precioTrimestral;
        break;
      case 'anual':
        amount = plan.precioAnual;
        break;
      default:
        throw new Error('Frecuencia de pago no válida');
    }

    // Crear la sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.nombre,
              description: plan.descripcion,
            },
            unit_amount: Math.round(amount * 100), // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}`,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        userId: userId,
        planId: planId,
        frecuenciaPago: frecuenciaPago
      },
    });

    // Guardar el registro de pago
    const payment = new Payment({
      userId: userId,
      suscriptionPlanId: planId,
      stripeSessionId: session.id,
      amount: amount,
      currency: 'eur',
      status: 'pending',
      frecuenciaPago: frecuenciaPago
    });

    await payment.save();

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Crea una suscripción gratuita sin proceso de pago
   */
  private static async createFreeSubscription(userId: string, planId: string) {
    // Verificar si el usuario ya tiene una suscripción
    const existingSub = await UserSuscription.findOne({ userId });
    if (existingSub) {
      throw new Error('El usuario ya tiene una suscripción activa');
    }

    const plan = await SuscriptionPlan.findById(planId);
    if (!plan || plan.tipoPrecio !== 'Gratuito') {
      throw new Error('Plan gratuito no válido');
    }

    // Crear suscripción gratuita
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setFullYear(fechaFin.getFullYear() + 1); // Las suscripciones gratuitas duran 1 año

    const userSubscription = new UserSuscription({
      userId,
      planId,
      fechaInicio,
      fechaFin,
      frecuenciaDePago: 'Anual',
    });

    await userSubscription.save();
    return userSubscription;
  }

  /**
   * Confirma un pago y crea la suscripción correspondiente
   * Se llama desde el webhook de Stripe cuando un pago se completa
   */
  static async confirmPayment(sessionId: string) {
    // Convertir frecuencia de pago a formato esperado por el modelo
    const convertirFrecuenciaPago = (frecuencia: string) => {
      switch (frecuencia) {
        case 'mensual':
          return 'Mensual';
        case 'trimestral':
          return 'Trimestral';
        case 'anual':
          return 'Anual';
        default:
          return 'Mensual';
      }
    };

    // Buscar el pago por ID de sesión
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      throw new Error(`No se encontró registro de pago para la sesión ${sessionId}`);
    }

    if (payment.status !== 'completed') {
      throw new Error(`El pago para la sesión ${sessionId} no está completado`);
    }

    // Verificar si ya existe una suscripción para este usuario
    const existingSub = await UserSuscription.findOne({ userId: payment.userId });
    if (existingSub) {
      // Si la suscripción existe, actualizar la fecha de fin basada en la frecuencia de pago
      const fechaFin = new Date(existingSub.fechaFin);
      
      switch (payment.frecuenciaPago) {
        case 'mensual':
          fechaFin.setMonth(fechaFin.getMonth() + 1);
          break;
        case 'trimestral':
          fechaFin.setMonth(fechaFin.getMonth() + 3);
          break;
        case 'anual':
          fechaFin.setFullYear(fechaFin.getFullYear() + 1);
          break;
      }
      
      existingSub.fechaFin = fechaFin;
      // Actualizar también la frecuencia de pago si es diferente
      existingSub.frecuenciaDePago = convertirFrecuenciaPago(payment.frecuenciaPago);
      await existingSub.save();
      
      // Actualizar el pago con la referencia a la suscripción si no existe
      if (!payment.userSuscriptionId) {
        payment.userSuscriptionId = existingSub._id as mongoose.Types.ObjectId;
        await payment.save();
      }
      
      return existingSub;
    }

    // Crear nueva suscripción
    const fechaInicio = new Date();
    const fechaFin = new Date();
    
    // Establecer la fecha de fin según la frecuencia de pago
    switch (payment.frecuenciaPago) {
      case 'mensual':
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        break;
      case 'trimestral':
        fechaFin.setMonth(fechaFin.getMonth() + 3);
        break;
      case 'anual':
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
        break;
    }

    const userSubscription = new UserSuscription({
      userId: payment.userId,
      planId: payment.suscriptionPlanId,
      fechaInicio,
      fechaFin,
      frecuenciaDePago: convertirFrecuenciaPago(payment.frecuenciaPago)
    });

    await userSubscription.save();
    
    // Actualizar el pago con la referencia a la nueva suscripción
    payment.userSuscriptionId = userSubscription._id as mongoose.Types.ObjectId;
    await payment.save();
    
    return userSubscription;
  }

  /**
   * Verifica el estado de un pago en Stripe manualmente
   * Útil para desarrollo local sin webhooks
   */
  static async checkStripePaymentStatus(sessionId: string) {
    try {
      // Verificar el estado del pago en Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Si el pago está completado, actualizar el registro local
      if (session.payment_status === 'paid') {
        const payment = await Payment.findOne({ stripeSessionId: sessionId });
        if (payment && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.paymentDate = new Date();
          await payment.save();
          
          // Crear la suscripción si no existe
          await this.confirmPayment(sessionId);
        }
        return { success: true, status: 'completed', session };
      }
      
      return { 
        success: true, 
        status: session.payment_status, 
        session 
      };
    } catch (error) {
      console.error('Error al verificar el estado del pago en Stripe:', error);
      return { 
        success: false, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
}
