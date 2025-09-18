import mongoose from 'mongoose';

export interface AssignmentRequestDocument extends mongoose.Document {
  // Usuario que solicita la asignación (role: 'user')
  usuarioSolicitante: mongoose.Types.ObjectId;
  
  // Trabajador al que se solicita la asignación (role: 'worker')
  trabajadorSolicitado: mongoose.Types.ObjectId;
  
  // Estado de la solicitud
  estado: 'pendiente' | 'aceptada' | 'rechazada';

}

const AssignmentRequestSchema = new mongoose.Schema({
  usuarioSolicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const User = mongoose.model('User');
        const user = await User.findById(value);
        return user && user.role === 'user';
      },
      message: 'El usuario solicitante debe existir y tener rol "user"'
    }
  },
  
  trabajadorSolicitado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const User = mongoose.model('User');
        const worker = await User.findById(value);
        return worker && worker.role === 'worker';
      },
      message: 'El trabajador solicitado debe existir y tener rol "worker"'
    }
  },
  
  estado: {
    type: String,
    enum: ['pendiente', 'aceptada', 'rechazada'],
    default: 'pendiente'
  }
}, { 
  timestamps: true // Esto añade automáticamente createdAt y updatedAt
});

// Validación para evitar solicitudes duplicadas
AssignmentRequestSchema.index(
  { usuarioSolicitante: 1, trabajadorSolicitado: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { estado: 'pendiente' }
  }
);

// Middleware para validar que no se pueda solicitar a un trabajador no disponible
AssignmentRequestSchema.pre('save', async function(next) {
  const doc = this as AssignmentRequestDocument;
  
  if (doc.isNew) {
    try {
      const User = mongoose.model('User');
      const worker = await User.findById(doc.trabajadorSolicitado);
      
      if (!worker || worker.role !== 'worker') {
        return next(new Error('El trabajador solicitado no existe o no es un trabajador'));
      }
      
      if (worker.isWorkerAvailable === false) {
        return next(new Error('El trabajador no está disponible para nuevas asignaciones'));
      }
      
      // Verificar que el usuario no esté ya asignado a este trabajador
      const existingAssignment = await User.findOne({
        _id: doc.usuarioSolicitante,
        clientesAsignados: doc.trabajadorSolicitado
      });
      
      if (existingAssignment) {
        return next(new Error('El usuario ya está asignado a este trabajador'));
      }
      
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  
  next();
});


const AssignmentRequest = mongoose.model<AssignmentRequestDocument>('AssignmentRequest', AssignmentRequestSchema);
export default AssignmentRequest;
