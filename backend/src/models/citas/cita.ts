import mongoose, { Document, Schema } from 'mongoose';

export interface CitaDocument extends Document {
  cliente: mongoose.Types.ObjectId;
  profesional: mongoose.Types.ObjectId;
  tipo: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
  estado: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'reagendada';
  fecha: Date;
  hora: string;
  duracion: number; // en minutos
  motivo: string;
  motivoCancelacion?: string;
  reagendadaDesde?: mongoose.Types.ObjectId; // ID de la cita original si fue reagendada
  createdAt: Date;
  updatedAt: Date;
}

const citaSchema = new Schema<CitaDocument>({
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profesional: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['seguimiento', 'consulta_nutricion', 'consulta_entrenamiento', 'evaluacion', 'revision'],
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'reagendada'],
    default: 'pendiente',
    index: true
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  hora: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido. Use HH:MM'
    }
  },
  duracion: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // máximo 8 horas
    default: 60
  },
  motivo: {
    type: String,
    required: true,
    maxlength: 500
  },
  motivoCancelacion: {
    type: String,
    maxlength: 500
  },
  reagendadaDesde: {
    type: Schema.Types.ObjectId,
    ref: 'Cita'
  }
}, {
  timestamps: true
});

// Índices compuestos para optimizar consultas
citaSchema.index({ cliente: 1, fecha: 1 });
citaSchema.index({ profesional: 1, fecha: 1 });
citaSchema.index({ estado: 1, fecha: 1 });
citaSchema.index({ fecha: 1, hora: 1 });

// Middleware para validar que no haya conflictos de horarios
citaSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified(['fecha', 'hora', 'duracion', 'profesional'])) {
    const fechaInicio = new Date(this.fecha);
    const [hora, minutos] = this.hora.split(':').map(Number);
    fechaInicio.setHours(hora, minutos, 0, 0);
    
    const fechaFin = new Date(fechaInicio.getTime() + this.duracion * 60000);
    
    // Buscar citas que se solapen con esta
    const citasConflictivas = await mongoose.model('Cita').find({
      _id: { $ne: this._id },
      profesional: this.profesional,
      estado: { $in: ['confirmada', 'en_progreso'] },
      $or: [
        {
          fecha: fechaInicio,
          hora: { $gte: this.hora, $lt: fechaFin.toTimeString().slice(0, 5) }
        },
        {
          fecha: { $gt: fechaInicio, $lt: fechaFin }
        }
      ]
    });
    
    if (citasConflictivas.length > 0) {
      const error = new Error('Ya existe una cita programada en ese horario para este profesional');
      return next(error);
    }
  }
  next();
});

// Método para verificar si la cita está en el pasado
citaSchema.methods.isPast = function(): boolean {
  const ahora = new Date();
  const fechaCita = new Date(this.fecha);
  const [hora, minutos] = this.hora.split(':').map(Number);
  fechaCita.setHours(hora, minutos, 0, 0);
  
  return fechaCita < ahora;
};

// Método para verificar si la cita puede ser cancelada
citaSchema.methods.canBeCancelled = function(): boolean {
  const fechaCita = new Date(this.fecha);
  const [hora, minutos] = this.hora.split(':').map(Number);
  fechaCita.setHours(hora, minutos, 0, 0);
  
  // Solo se puede cancelar si no ha pasado y no está completada
  return !this.isPast() && !['completada', 'cancelada'].includes(this.estado);
};

// Método para verificar si la cita puede ser reagendada
citaSchema.methods.canBeRescheduled = function(): boolean {
  const fechaCita = new Date(this.fecha);
  const [hora, minutos] = this.hora.split(':').map(Number);
  fechaCita.setHours(hora, minutos, 0, 0);
  
  // Solo se puede reagendar si no ha pasado y no está completada o cancelada
  return !this.isPast() && !['completada', 'cancelada'].includes(this.estado);
};

export default mongoose.model<CitaDocument>('Cita', citaSchema);
