import mongoose from 'mongoose';

const EjercicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String},
  grupoMuscular: { 
    type: String, 
    required: true,
    enum: ['Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas']
  },
  equipamiento: { 
    type: String, 
    required: true,
    enum: ['Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia']
  },
  series: { type: Number, required: true, min: 1 },
  repeticiones: { type: Number, required: true, min: 1 },
  tiempoDescanso: { type: Number, required: true, min: 0 },
  nivelDificultad: { 
    type: String, 
    required: true,
    enum: ['Principiante', 'Intermedio', 'Avanzado']
  },
  nivelIntensidad: { 
    type: String, 
    required: true,
    enum: ['Baja', 'Media', 'Alta']
  },
  videoDemostrativo: { type: String },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publico: { type: Boolean, default: false },
  activo: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
EjercicioSchema.index({ nombre: 1 });
EjercicioSchema.index({ grupoMuscular: 1 });
EjercicioSchema.index({ nivelDificultad: 1 });
EjercicioSchema.index({ creador: 1 });

export default mongoose.model('Ejercicio', EjercicioSchema);
