import mongoose from 'mongoose';

interface UserTrackingDocument extends mongoose.Document {
  // Referencia al usuario
  userId: mongoose.Types.ObjectId;
  
  // Fecha del seguimiento
  fechaSeguimiento: Date;
  
  // Mediciones individuales (opcionales)
  pesoCorporal?: number;
  porcentajeGrasaCorporal?: number;
  porcentajeMasaMuscular?: number;
  
  // Perímetros
  perimetroCintura?: number;
  perimetroCadera?: number;
  perimetroPecho?: number;
  
  // Perímetros bilaterales (opcionales)
  perimetroBrazoIzquierdo?: number;
  perimetroBrazoDerecho?: number;
  perimetroMusloIzquierdo?: number;
  perimetroMusloDerecho?: number;
  
  // Archivos multimedia del seguimiento
  archivosMultimedia: string[];
  
  // Campos del sistema
  createdAt: Date;
  updatedAt: Date;
}

const UserTrackingSchema = new mongoose.Schema({
  // Referencia al usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Fecha del seguimiento
  fechaSeguimiento: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Peso corporal (en kg)
  pesoCorporal: {
    type: Number,
    min: 0,
    max: 1000
  },
  
  // Porcentaje de grasa corporal (0-100%)
  porcentajeGrasaCorporal: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Porcentaje de masa muscular (0-100%)
  porcentajeMasaMuscular: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Perímetros (en cm)
  perimetroCintura: {
    type: Number,
    min: 0,
    max: 200
  },
  perimetroCadera: {
    type: Number,
    min: 0,
    max: 200
  },
  perimetroPecho: {
    type: Number,
    min: 0,
    max: 200
  },
  
  // Perímetros bilaterales (en cm)
  perimetroBrazoIzquierdo: {
    type: Number,
    min: 0,
    max: 200
  },
  perimetroBrazoDerecho: {
    type: Number,
    min: 0,
    max: 200
  },
  perimetroMusloIzquierdo: {
    type: Number,
    min: 0,
    max: 200
  },
  perimetroMusloDerecho: {
    type: Number,
    min: 0,
    max: 200
  },
  
  // Archivos multimedia del seguimiento (máximo 3)
  archivosMultimedia: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 3;
      },
      message: 'Máximo 3 archivos multimedia por seguimiento'
    }
  }
}, { 
  timestamps: true,
  collection: 'usertracking'
});

// Índices para mejorar el rendimiento
UserTrackingSchema.index({ userId: 1, fechaSeguimiento: -1 });
UserTrackingSchema.index({ fechaSeguimiento: -1 });

// Middleware para validar que el usuario existe y es de tipo 'user'
UserTrackingSchema.pre('save', async function (next) {
  const doc = this as UserTrackingDocument;
  
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.userId);
    
    if (!user) {
      return next(new Error('El usuario no existe'));
    }
    
    if (user.role !== 'user') {
      return next(new Error('Solo los usuarios con rol "user" pueden tener seguimiento'));
    }
    
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const UserTracking = mongoose.model<UserTrackingDocument>('UserTracking', UserTrackingSchema);

export default UserTracking;
export { UserTrackingDocument };