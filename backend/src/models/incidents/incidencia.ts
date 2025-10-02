import mongoose from 'mongoose';

interface IncidenciaDocument extends mongoose.Document {
  // Usuario o trabajador que creó la incidencia (referencia simple)
  creadorId: mongoose.Types.ObjectId;
  
  // Descripción de la incidencia
  descripcion: string;
  
  // Estado de la incidencia
  estado: 'Por resolver' | 'En proceso de resolución' | 'Resuelta';
  
  // Administrador encargado de resolver la incidencia (referencia simple, opcional)
  administradorAsignado?: mongoose.Types.ObjectId;
  
  // Imágenes adjuntas (máximo 5)
  imagenes?: string[];
  
  // Campos adicionales del sistema
  fechaResolucion?: Date;
}

const IncidenciaSchema = new mongoose.Schema({
  creadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  descripcion: {
    type: String,
    required: true,
    minlength: [1, 'La descripción debe tener al menos 1 carácter'],
    maxlength: [10000, 'La descripción no puede exceder los 10000 caracteres']
  },
  
  estado: {
    type: String,
    enum: ['Por resolver', 'En proceso de resolución', 'Resuelta'],
    default: 'Por resolver'
  },
  
  administradorAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  imagenes: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return Array.isArray(arr) ? arr.length <= 5 : true;
      },
      message: 'No se pueden adjuntar más de 5 imágenes'
    }
  },
  
  fechaResolucion: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Validación pre-save para verificar que el creador existe y tiene el rol correcto
IncidenciaSchema.pre('save', async function (next) {
  const doc = this as IncidenciaDocument;
  
  try {
    const User = mongoose.model('User');
    
    // Verificar que el creador existe y tiene rol válido (user o worker)
    if (doc.creadorId) {
      const creador = await User.findById(doc.creadorId);
      
      if (!creador) {
        return next(new Error('El usuario creador no existe'));
      }
      
      // Verificar que el creador no sea admin (solo users y workers pueden crear incidencias)
      if (creador.role !== 'user' && creador.role !== 'worker') {
        return next(new Error('Solo usuarios y trabajadores pueden crear incidencias'));
      }
    }
    
    // Si se asigna un administrador, verificar que existe y es admin
    if (doc.administradorAsignado) {
      const admin = await User.findById(doc.administradorAsignado);
      
      if (!admin) {
        return next(new Error('El administrador asignado no existe'));
      }
      
      if (admin.role !== 'admin') {
        return next(new Error('Solo se pueden asignar administradores para resolver incidencias'));
      }
    }
    
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// Middleware para establecer fechaResolucion cuando el estado cambia a 'Resuelta'
IncidenciaSchema.pre('save', function (next) {
  const doc = this as IncidenciaDocument;
  
  // Si el estado cambia a 'Resuelta' y no hay fecha de resolución, establecerla
  if (doc.estado === 'Resuelta' && !doc.fechaResolucion) {
    doc.fechaResolucion = new Date();
  }
  
  // Si el estado no es 'Resuelta' pero hay fecha de resolución, limpiarla
  if (doc.estado !== 'Resuelta' && doc.fechaResolucion) {
    doc.fechaResolucion = undefined;
  }
  
  next();
});

// Índices para optimizar consultas
IncidenciaSchema.index({ creadorId: 1 });
IncidenciaSchema.index({ estado: 1 });
IncidenciaSchema.index({ administradorAsignado: 1 });
IncidenciaSchema.index({ createdAt: -1 });

const Incidencia = mongoose.model<IncidenciaDocument>('Incidencia', IncidenciaSchema);

export default Incidencia;
