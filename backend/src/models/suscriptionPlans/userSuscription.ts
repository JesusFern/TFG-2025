import mongoose from 'mongoose';

export interface UserSuscriptionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  frecuenciaDePago: 'Mensual' | 'Trimestral' | 'Anual';
  ultimoPago?: mongoose.Types.ObjectId;
  estadoPago: 'pendiente' | 'pagado' | 'vencido';
  fechaProximoPago?: Date;
  stripeSubscriptionId?: string; // Para suscripciones recurrentes
  
  actualizarEstadoPago(paymentId: mongoose.Types.ObjectId, estado: 'pendiente' | 'pagado' | 'vencido'): Promise<UserSuscriptionDocument>;
  renovarSuscripcion(): Promise<UserSuscriptionDocument>;
  isActive(): boolean;
}

const UserSuscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuscriptionPlan',
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true,
    default: Date.now
  },
  fechaFin: {
    type: Date,
    required: true
  },
  frecuenciaDePago: {
    type: String,
    enum: ['Mensual', 'Trimestral', 'Anual'],
    required: true
  },
  ultimoPago: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'vencido'],
    required: true,
    default: 'pendiente'
  },
  fechaProximoPago: {
    type: Date
  },
  stripeSubscriptionId: {
    type: String,
    required: false
  },
}, { timestamps: true });

// Validar que la fecha de fin sea posterior a la fecha de inicio
UserSuscriptionSchema.pre('validate', function(next) {
  if (this.fechaFin <= this.fechaInicio) {
    this.invalidate('fechaFin', 'La fecha de fin debe ser posterior a la fecha de inicio');
  }
  
  next();
});

// Validar que la frecuencia de pago sea coherente con el plan seleccionado
UserSuscriptionSchema.pre('save', async function(next) {
  try {
    const planId = this.planId;
    const frecuenciaDePago = this.frecuenciaDePago;
    
    const SuscriptionPlan = mongoose.model('SuscriptionPlan');
    
    const plan = await SuscriptionPlan.findById(planId);
    if (!plan) {
      return next(new Error('El plan de suscripción no existe'));
    }
    
    
    // Verificar que el precio para la frecuencia elegida no sea 0
    if (frecuenciaDePago === 'Mensual' && plan.precioMensual <= 0) {
      return next(new Error('Este plan no ofrece frecuencia de pago mensual'));
    }
    
    if (frecuenciaDePago === 'Trimestral' && plan.precioTrimestral <= 0) {
      return next(new Error('Este plan no ofrece frecuencia de pago trimestral'));
    }
    
    if (frecuenciaDePago === 'Anual' && plan.precioAnual <= 0) {
      return next(new Error('Este plan no ofrece frecuencia de pago anual'));
    }
    
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// Validar que solo usuarios con rol 'user' puedan tener suscripciones
UserSuscriptionSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const userId = this.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return next(new Error('El usuario no existe'));
    }
    
    if (user.role !== 'user') {
      return next(new Error('Solo los usuarios con rol "user" pueden tener suscripciones'));
    }
    
    // Asegurarse de que se actualiza la referencia en el modelo de usuario
    if (!user.suscripcion || !user.suscripcion.equals(this._id)) {
      await User.findByIdAndUpdate(user._id, { suscripcion: this._id });
    }
    
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// Calcular la fecha del próximo pago basado en la frecuencia
UserSuscriptionSchema.pre('save', function(next) {
  // Solo calculamos la fecha del próximo pago para suscripciones de pago
  if (!this.fechaProximoPago && this.estadoPago !== 'pagado') {
    const fechaInicio = new Date(this.fechaInicio);
    
    if (this.frecuenciaDePago === 'Mensual') {
      this.fechaProximoPago = new Date(fechaInicio.setMonth(fechaInicio.getMonth() + 1));
    } else if (this.frecuenciaDePago === 'Trimestral') {
      this.fechaProximoPago = new Date(fechaInicio.setMonth(fechaInicio.getMonth() + 3));
    } else if (this.frecuenciaDePago === 'Anual') {
      this.fechaProximoPago = new Date(fechaInicio.setFullYear(fechaInicio.getFullYear() + 1));
    }
  }
  
  // Verificar si el pago está vencido
  const now = new Date();
  if (this.fechaProximoPago && this.fechaProximoPago < now && this.estadoPago !== 'vencido') {
    this.estadoPago = 'vencido';
  }
  
  next();
});

// Método para actualizar el estado de pago
UserSuscriptionSchema.methods.actualizarEstadoPago = async function(paymentId: mongoose.Types.ObjectId, estado: 'pendiente' | 'pagado' | 'vencido') {
  const Payment = mongoose.model('Payment');
  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    throw new Error('El pago no existe');
  }
  
  this.ultimoPago = paymentId;
  this.estadoPago = estado;
  
  // Si el pago está completado, actualizar la fecha del próximo pago
  if (estado === 'pagado') {
    const fechaActual = new Date();
    
    if (this.frecuenciaDePago === 'Mensual') {
      this.fechaProximoPago = new Date(fechaActual.setMonth(fechaActual.getMonth() + 1));
    } else if (this.frecuenciaDePago === 'Trimestral') {
      this.fechaProximoPago = new Date(fechaActual.setMonth(fechaActual.getMonth() + 3));
    } else if (this.frecuenciaDePago === 'Anual') {
      this.fechaProximoPago = new Date(fechaActual.setFullYear(fechaActual.getFullYear() + 1));
    }
  }
  
  await this.save();
  return this;
};

// Método para renovar una suscripción
UserSuscriptionSchema.methods.renovarSuscripcion = async function() {
  const now = new Date();
  const nuevaFechaFin = new Date(now);
  
  // Calcular nueva fecha de fin según la frecuencia
  switch (this.frecuenciaDePago) {
    case 'Mensual':
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);
      break;
    case 'Trimestral':
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 3);
      break;
    case 'Anual':
      nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() + 1);
      break;
  }
  
  // Actualizar fechas
  this.fechaInicio = now;
  this.fechaFin = nuevaFechaFin;
  this.estadoPago = 'pagado';
  
  // Calcular próxima fecha de pago
  const proximaFechaPago = new Date(now);
  switch (this.frecuenciaDePago) {
    case 'Mensual':
      proximaFechaPago.setMonth(proximaFechaPago.getMonth() + 1);
      break;
    case 'Trimestral':
      proximaFechaPago.setMonth(proximaFechaPago.getMonth() + 3);
      break;
    case 'Anual':
      proximaFechaPago.setFullYear(proximaFechaPago.getFullYear() + 1);
      break;
  }
  this.fechaProximoPago = proximaFechaPago;
  
  await this.save();
  return this;
};

// Método para verificar si una suscripción está activa
UserSuscriptionSchema.methods.isActive = function() {
  const now = new Date();
  
  // Una suscripción está activa si:
  // 1. No ha expirado (fecha fin es posterior a hoy)
  // 2. El estado de pago es 'pagado' o es un plan gratuito
  return this.fechaFin > now && (this.estadoPago === 'pagado' || !this.fechaProximoPago);
};

const UserSuscription = mongoose.model<UserSuscriptionDocument>('UserSuscription', UserSuscriptionSchema);
export default UserSuscription;
