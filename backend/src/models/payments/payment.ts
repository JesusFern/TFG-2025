import mongoose from 'mongoose';

export interface PaymentDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  suscriptionPlanId: mongoose.Types.ObjectId;
  userSuscriptionId?: mongoose.Types.ObjectId; // Opcional inicialmente
  stripeSessionId: string;
  stripeCustomerId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate?: Date;
  frecuenciaPago: 'mensual' | 'trimestral' | 'anual';
  
  // Métodos
  markAsCompleted(): Promise<PaymentDocument>;
  markAsFailed(): Promise<PaymentDocument>;
  markAsRefunded(): Promise<PaymentDocument>;
}

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  suscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuscriptionPlan',
    required: true
  },
  userSuscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSuscription',
    required: false
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'eur'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  frecuenciaPago: {
    type: String,
    enum: ['mensual', 'trimestral', 'anual'],
    required: true
  }
}, { timestamps: true });

// Métodos para actualizar el estado del pago
PaymentSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  this.paymentDate = new Date();
  await this.save();
  return this;
};

PaymentSchema.methods.markAsFailed = async function() {
  this.status = 'failed';
  await this.save();
  return this;
};

PaymentSchema.methods.markAsRefunded = async function() {
  this.status = 'refunded';
  await this.save();
  return this;
};

// Hook para actualizar el estado de la suscripción cuando cambia el estado del pago
PaymentSchema.post('save', async function(doc) {
  try {
    const payment = doc as unknown as {
      _id: mongoose.Types.ObjectId;
      userSuscriptionId: mongoose.Types.ObjectId;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
    };
    
    const UserSuscription = mongoose.model('UserSuscription');
    
    // Buscar la suscripción asociada a este pago
    const userSuscription = await UserSuscription.findById(payment.userSuscriptionId);
    if (!userSuscription) {
      console.error(`No se encontró suscripción con ID ${payment.userSuscriptionId}`);
      return;
    }
    
    // Actualizar el estado de pago según el estado del pago
    if (payment.status === 'completed') {
      await userSuscription.actualizarEstadoPago(payment._id, 'pagado');
    } else if (payment.status === 'failed') {
      await userSuscription.actualizarEstadoPago(payment._id, 'vencido');
    } else if (payment.status === 'pending') {
      await userSuscription.actualizarEstadoPago(payment._id, 'pendiente');
    }
  } catch (error) {
    console.error('Error al actualizar el estado de la suscripción:', error);
  }
});

const Payment = mongoose.model<PaymentDocument>('Payment', PaymentSchema);
export default Payment;
