import mongoose from 'mongoose';

interface ValoracionDocument extends mongoose.Document {
  cliente: mongoose.Types.ObjectId;
  trabajador: mongoose.Types.ObjectId;
  calificacion: number;
  descripcion: string;
  fechaValoracion: Date;
  tipoTrabajador: 'Nutricionista' | 'Entrenador personal';
  activa: boolean;
}

const ValoracionSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trabajador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'La calificación debe ser un número entero'
    }
  },
  descripcion: {
    type: String,
    required: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  fechaValoracion: {
    type: Date,
    default: Date.now
  },
  tipoTrabajador: {
    type: String,
    enum: ['Nutricionista', 'Entrenador personal'],
    required: true
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ValoracionSchema.index({ cliente: 1, trabajador: 1, tipoTrabajador: 1 });
ValoracionSchema.index({ trabajador: 1, activa: 1 });
ValoracionSchema.index({ trabajador: 1, tipoTrabajador: 1, activa: 1 });
ValoracionSchema.index({ fechaValoracion: -1 });

// Middleware para validar que el cliente está asignado al trabajador
ValoracionSchema.pre('save', async function (next) {
  try {
    const User = mongoose.model('User');
    
    // Verificar que el cliente existe y tiene rol 'user'
    const cliente = await User.findById(this.cliente);
    if (!cliente || cliente.role !== 'user') {
      return next(new Error('El cliente debe ser un usuario con rol user'));
    }

    // Verificar que el trabajador existe y tiene rol 'worker'
    const trabajador = await User.findById(this.trabajador);
    if (!trabajador || trabajador.role !== 'worker') {
      return next(new Error('El trabajador debe ser un usuario con rol worker'));
    }

    // Verificar que el cliente está asignado al trabajador
    const asignacion = trabajador.clientesAsignados?.find(
      (asignacion: { clienteId: mongoose.Types.ObjectId; tipoAsignacion: string }) => 
        asignacion.clienteId.toString() === this.cliente.toString() &&
        asignacion.tipoAsignacion === this.tipoTrabajador
    );

    if (!asignacion) {
      return next(new Error('El cliente no está asignado a este trabajador'));
    }

    // Verificar que no existe ya una valoración activa del mismo cliente al mismo trabajador para el mismo tipo
    const valoracionExistente = await mongoose.model('Valoracion').findOne({
      cliente: this.cliente,
      trabajador: this.trabajador,
      tipoTrabajador: this.tipoTrabajador,
      activa: true,
      _id: { $ne: this._id }
    });

    if (valoracionExistente) {
      return next(new Error(`Ya existe una valoración activa para este trabajador como ${this.tipoTrabajador}`));
    }

    next();
  } catch (err) {
    next(err as mongoose.CallbackError);
  }
});

// Middleware post-save para actualizar la calificación promedio del trabajador
ValoracionSchema.post('save', async function () {
  try {
    const User = mongoose.model('User');
    
    // Calcular la calificación promedio del trabajador
    const valoraciones = await mongoose.model('Valoracion').find({
      trabajador: this.trabajador,
      activa: true
    });

    if (valoraciones.length > 0) {
      const promedio = valoraciones.reduce((sum, val) => sum + val.calificacion, 0) / valoraciones.length;
      
      await User.findByIdAndUpdate(this.trabajador, {
        satisfactionRating: Math.round(promedio * 10) / 10 // Redondear a 1 decimal
      });
    }
  } catch (err) {
    void err; // silenciar variable no usada
  }
});

// Middleware post-remove para recalcular la calificación promedio del trabajador
ValoracionSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const User = mongoose.model('User');
      
      // Recalcular la calificación promedio del trabajador
      const valoraciones = await mongoose.model('Valoracion').find({
        trabajador: doc.trabajador,
        activa: true
      });

      if (valoraciones.length > 0) {
        const promedio = valoraciones.reduce((sum, val) => sum + val.calificacion, 0) / valoraciones.length;
        
        await User.findByIdAndUpdate(doc.trabajador, {
          satisfactionRating: Math.round(promedio * 10) / 10
        });
      } else {
        // Si no hay valoraciones, eliminar la calificación
        await User.findByIdAndUpdate(doc.trabajador, {
          $unset: { satisfactionRating: 1 }
        });
      }
    } catch (err) {
      void err; // silenciar variable no usada
    }
  }
});

export default mongoose.model<ValoracionDocument>('Valoracion', ValoracionSchema);
