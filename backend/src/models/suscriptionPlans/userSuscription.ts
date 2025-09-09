import mongoose from 'mongoose';

export interface UserSuscriptionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  frecuenciaDePago: 'Mensual' | 'Trimestral' | 'Anual';
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
  }
}, { timestamps: true });

// Validar que la fecha de fin sea posterior a la fecha de inicio
UserSuscriptionSchema.pre('validate', function(next) {
  const suscripcion = this as UserSuscriptionDocument;
  
  if (suscripcion.fechaFin <= suscripcion.fechaInicio) {
    this.invalidate('fechaFin', 'La fecha de fin debe ser posterior a la fecha de inicio');
  }
  
  next();
});

// Validar que la frecuencia de pago sea coherente con el plan seleccionado
UserSuscriptionSchema.pre('save', async function(next) {
  try {
    const suscripcion = this as UserSuscriptionDocument;
    const SuscriptionPlan = mongoose.model('SuscriptionPlan');
    
    const plan = await SuscriptionPlan.findById(suscripcion.planId);
    if (!plan) {
      return next(new Error('El plan de suscripción no existe'));
    }
    
    // Si es plan gratuito, no importa la frecuencia de pago
    if (plan.tipo === 'Gratuito') {
      next();
      return;
    }
    
    // Verificar que el precio para la frecuencia elegida no sea 0
    if (suscripcion.frecuenciaDePago === 'Mensual' && plan.precioMensual <= 0) {
      return next(new Error('Este plan no ofrece frecuencia de pago mensual'));
    }
    
    if (suscripcion.frecuenciaDePago === 'Trimestral' && plan.precioTrimestral <= 0) {
      return next(new Error('Este plan no ofrece frecuencia de pago trimestral'));
    }
    
    if (suscripcion.frecuenciaDePago === 'Anual' && plan.precioAnual <= 0) {
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
    const suscripcion = this as UserSuscriptionDocument;
    
    const user = await User.findById(suscripcion.userId);
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

const UserSuscription = mongoose.model<UserSuscriptionDocument>('UserSuscription', UserSuscriptionSchema);
export default UserSuscription;
