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

    // Determinar el intervalo de facturación
    let interval: 'day' | 'week' | 'month' | 'year';
    let intervalCount: number;
    
    // En modo de desarrollo, usar intervalos más cortos para pruebas
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Intervalos de prueba para desarrollo
      switch (frecuenciaPago) {
        case 'mensual':
          interval = 'day';
          intervalCount = 1; // 1 día para pruebas
          break;
        case 'trimestral':
          interval = 'day';
          intervalCount = 3; // 3 días para pruebas
          break;
        case 'anual':
          interval = 'day';
          intervalCount = 7; // 7 días para pruebas
          break;
        default:
          throw new Error('Frecuencia de pago no válida');
      }
    } else {
      // Intervalos de producción
      switch (frecuenciaPago) {
        case 'mensual':
          interval = 'month';
          intervalCount = 1;
          break;
        case 'trimestral':
          interval = 'month';
          intervalCount = 3;
          break;
        case 'anual':
          interval = 'year';
          intervalCount = 1;
          break;
        default:
          throw new Error('Frecuencia de pago no válida');
      }
    }

    // Crear la sesión de suscripción en Stripe
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
            recurring: {
              interval: interval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
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
   * Crea una sesión de checkout para upgrade de suscripción
   */
  static async createUpgradeCheckoutSession(
    userId: string, 
    newPlanId: string, 
    frecuenciaPago: 'mensual' | 'trimestral' | 'anual',
    successUrl: string,
    cancelUrl: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.role !== 'user') {
      throw new Error('Solo los usuarios pueden hacer upgrade de suscripción');
    }

    // Buscar suscripción actual (opcional)
    const currentSubscription = await UserSuscription.findOne({ userId })
      .populate('planId');
    
    const newPlan = await SuscriptionPlan.findById(newPlanId);
    
    if (!newPlan) {
      throw new Error('Plan de suscripción no encontrado');
    }

    // Si tiene suscripción, permitir cambios entre cualquier plan
    if (currentSubscription) {
      // Permitir cambios entre cualquier plan
    }

    // Usar precio completo del plan combinado (sin rebaja)
    let fullPrice = 0;
    
    switch (frecuenciaPago) {
      case 'mensual':
        fullPrice = newPlan.precioMensual;
        break;
      case 'trimestral':
        fullPrice = newPlan.precioTrimestral;
        break;
      case 'anual':
        fullPrice = newPlan.precioAnual;
        break;
    }
    
    if (fullPrice <= 0) {
      throw new Error('El plan no tiene precio válido');
    }

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email, // Pasar el correo electrónico del usuario
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Mejora a ${newPlan.nombre}`,
              description: `Precio completo por ${frecuenciaPago}`,
            },
            unit_amount: Math.round(fullPrice * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        newPlanId: newPlanId,
        currentSubscriptionId: currentSubscription ? String(currentSubscription._id) : null,
        isChange: 'true',
        frecuenciaPago: frecuenciaPago
      },
    });

    // Guardar el registro de pago para el upgrade
    const payment = new Payment({
      userId: userId,
      suscriptionPlanId: newPlanId,
      stripeSessionId: session.id,
      amount: fullPrice,
      currency: 'eur',
      status: 'pending',
      frecuenciaPago: frecuenciaPago,
      metadata: {
        isChange: 'true',
        currentSubscriptionId: currentSubscription ? String(currentSubscription._id) : null,
        newPlanId: newPlanId
      }
    });

    await payment.save();

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Confirma un pago y crea la suscripción correspondiente
   * Se llama desde el webhook de Stripe cuando un pago se completa
   */
  static async confirmPayment(sessionId: string) {
    console.log('confirmPayment: Iniciando confirmación para sesión:', sessionId);
    
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
      console.error('confirmPayment: Pago no encontrado para sesión:', sessionId);
      throw new Error(`No se encontró registro de pago para la sesión ${sessionId}`);
    }

    console.log('confirmPayment: Pago encontrado:', {
      id: payment._id,
      status: payment.status,
      userId: payment.userId,
      planId: payment.suscriptionPlanId,
      metadata: payment.metadata
    });

    if (payment.status !== 'completed') {
      console.error('confirmPayment: Pago no está completado, estado:', payment.status);
      throw new Error(`El pago para la sesión ${sessionId} no está completado`);
    }

    // Obtener información de la sesión de Stripe para suscripciones recurrentes
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    console.log('confirmPayment: Sesión de Stripe:', {
      mode: stripeSession.mode,
      subscription: stripeSession.subscription
    });

    // Verificar si es un cambio
    const isChange = payment.metadata?.isChange === 'true';
    console.log('confirmPayment: Es cambio?', isChange);
    
    if (isChange) {
      // Manejar cambio de suscripción
      const currentSubscriptionId = payment.metadata?.currentSubscriptionId;
      const newPlanId = payment.metadata?.newPlanId;
      
      console.log('confirmPayment: Datos de cambio:', {
        currentSubscriptionId,
        newPlanId,
        metadata: payment.metadata
      });
      
      if (!newPlanId) {
        console.error('confirmPayment: Falta newPlanId en metadata');
        throw new Error('Información de cambio incompleta - falta newPlanId');
      }
      
      // Verificar que el plan existe
      const plan = await SuscriptionPlan.findById(newPlanId);
      if (!plan) {
        console.error('confirmPayment: Plan no encontrado:', newPlanId);
        throw new Error(`Plan de suscripción no encontrado: ${newPlanId}`);
      }
      
      console.log('confirmPayment: Plan encontrado:', {
        id: plan._id,
        nombre: plan.nombre,
        tipoPlan: plan.tipoPlan
      });
      
      let userSubscription;
      
      if (currentSubscriptionId) {
        // Si existe una suscripción actual, actualizarla
        userSubscription = await UserSuscription.findById(currentSubscriptionId);
        if (!userSubscription) {
          throw new Error('Suscripción actual no encontrada');
        }
        
        console.log('Actualizando suscripción existente:', currentSubscriptionId);
      } else {
        // Si no existe suscripción, buscar si hay alguna para el usuario
        userSubscription = await UserSuscription.findOne({ userId: payment.userId });
        
        if (!userSubscription) {
          // Crear nueva suscripción si no existe ninguna
          console.log('Creando nueva suscripción para usuario:', payment.userId);
          userSubscription = new UserSuscription({
            userId: payment.userId,
            planId: newPlanId,
            fechaInicio: new Date(),
            fechaFin: new Date(),
            frecuenciaDePago: convertirFrecuenciaPago(payment.frecuenciaPago),
            estadoPago: 'pagado'
          });
        } else {
          console.log('Actualizando suscripción existente del usuario:', payment.userId);
        }
      }
      
      // Calcular nuevas fechas
      const now = new Date();
      const nuevaFechaFin = new Date(now);
      
      // Calcular nueva fecha de fin según la frecuencia de pago
      switch (payment.frecuenciaPago) {
        case 'mensual':
          nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);
          break;
        case 'trimestral':
          nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 3);
          break;
        case 'anual':
          nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() + 1);
          break;
      }
      
      // Actualizar o crear la suscripción
      userSubscription.planId = new mongoose.Types.ObjectId(newPlanId);
      userSubscription.fechaInicio = now;
      userSubscription.fechaFin = nuevaFechaFin;
      userSubscription.frecuenciaDePago = convertirFrecuenciaPago(payment.frecuenciaPago);
      userSubscription.estadoPago = 'pagado';
      await userSubscription.save();
      
      // Actualizar el pago con la referencia a la suscripción
      if (!payment.userSuscriptionId) {
        payment.userSuscriptionId = userSubscription._id as mongoose.Types.ObjectId;
        await payment.save();
      }
      
      console.log('Upgrade de suscripción completado', {
        userId: payment.userId,
        oldPlanId: payment.suscriptionPlanId,
        newPlanId: newPlanId,
        subscriptionId: userSubscription._id,
        action: currentSubscriptionId ? 'updated' : 'created'
      });
      
      return userSubscription;
    }
    
    // Verificar si ya existe una suscripción para este usuario (suscripción normal)
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

    // Determinar si es una suscripción recurrente
    const stripeSubscriptionId = stripeSession.subscription 
      ? (typeof stripeSession.subscription === 'string' 
          ? stripeSession.subscription 
          : stripeSession.subscription.id)
      : undefined;

    const userSubscription = new UserSuscription({
      userId: payment.userId,
      planId: payment.suscriptionPlanId,
      fechaInicio,
      fechaFin,
      frecuenciaDePago: convertirFrecuenciaPago(payment.frecuenciaPago),
      stripeSubscriptionId: stripeSubscriptionId,
      estadoPago: 'pagado'
    });

    await userSubscription.save();
    
    // Actualizar el pago con la referencia a la nueva suscripción y Stripe
    payment.userSuscriptionId = userSubscription._id as mongoose.Types.ObjectId;
    if (stripeSubscriptionId) {
      payment.stripeSubscriptionId = stripeSubscriptionId;
    }
    await payment.save();
    
    console.log('Nueva suscripción creada:', {
      id: userSubscription._id,
      stripeSubscriptionId: stripeSubscriptionId
    });
    
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
