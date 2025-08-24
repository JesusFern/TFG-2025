import mongoose from 'mongoose';

const EjercicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
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
  tiempoDescanso: { type: Number, required: true, min: 0 }, // en segundos
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
  videoDemostrativo: { type: String }, // URL del video/GIF
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
