import mongoose from 'mongoose';

export interface AssignmentRequestDocument extends mongoose.Document {
  // Usuario que solicita la asignación (role: 'user')
  usuarioSolicitante: mongoose.Types.ObjectId;
  
  // Trabajador al que se solicita la asignación (role: 'worker')
  trabajadorSolicitado: mongoose.Types.ObjectId;
  
  // Tipo de asignación solicitada
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  
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
  
  tipoAsignacion: {
    type: String,
    enum: ['Nutricionista', 'Entrenador personal'],
    required: true
  },
  
  estado: {
    type: String,
    enum: ['pendiente', 'aceptada', 'rechazada'],
    default: 'pendiente'
  }
}, { 
  timestamps: true
});

// Validación para evitar solicitudes duplicadas del mismo tipo al mismo trabajador
AssignmentRequestSchema.index(
  { usuarioSolicitante: 1, trabajadorSolicitado: 1, tipoAsignacion: 1 }, 
  { 
    unique: true,
    name: 'usuarioSolicitante_1_trabajadorSolicitado_1_tipoAsignacion_1'
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
      
      // Verificar que el trabajador puede realizar el tipo de asignación solicitada
      const workerType = worker.workerType;
      const tipoAsignacion = doc.tipoAsignacion;
      
      if (tipoAsignacion === 'Nutricionista' && workerType !== 'Nutricionista' && workerType !== 'Nutricionista y Entrenador personal') {
        return next(new Error('El trabajador no puede realizar asignaciones como nutricionista'));
      }
      
      if (tipoAsignacion === 'Entrenador personal' && workerType !== 'Entrenador personal' && workerType !== 'Nutricionista y Entrenador personal') {
        return next(new Error('El trabajador no puede realizar asignaciones como entrenador personal'));
      }
      
      // Verificar que el usuario no esté ya asignado a este trabajador para este tipo de asignación
      // Buscar en el trabajador si ya tiene este cliente asignado para este tipo
      const existingAssignment = await User.findOne({
        _id: doc.trabajadorSolicitado,
        'clientesAsignados.clienteId': doc.usuarioSolicitante,
        'clientesAsignados.tipoAsignacion': tipoAsignacion
      });
      
      if (existingAssignment) {
        return next(new Error(`El usuario ya está asignado a este trabajador como ${tipoAsignacion}`));
      }
      
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  
  next();
});


const AssignmentRequest = mongoose.model<AssignmentRequestDocument>('AssignmentRequest', AssignmentRequestSchema);
export default AssignmentRequest;
