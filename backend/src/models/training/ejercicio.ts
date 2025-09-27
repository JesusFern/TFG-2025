import mongoose from 'mongoose';

const EjercicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  descripcion: { type: String},
  grupoMuscular: { 
    type: String, 
    required: true,
    enum: ['Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas']
  },
  equipamiento: { 
    type: String, 
    required: true,
    enum: ['Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia', 'Barra de dominadas', 'Banco', 'Cable', 'Kettlebell']
  },
  nivelDificultad: { 
    type: String, 
    required: true,
    enum: ['Principiante', 'Intermedio', 'Avanzado']
  },
  tipoEjercicio: {
    type: String,
    required: true,
    enum: ['Fuerza', 'Cardio', 'Flexibilidad', 'HIIT', 'Resistencia', 'Potencia', 'Estabilidad']
  },
  instrucciones: { type: String },
  videoDemostrativo: { type: String },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  arquetipo: { type: Boolean, default: false }, // true para ejercicios predefinidos del sistema
  publico: { type: Boolean, default: true },
  activo: { type: Boolean, default: true },
  esWger: { type: Boolean, default: false }, // true para ejercicios creados desde wger
  wgerId: { type: Number } // ID original de wger
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
EjercicioSchema.index({ nombre: 1 });
// slug ya tiene índice único por unique: true
EjercicioSchema.index({ grupoMuscular: 1 });
EjercicioSchema.index({ nivelDificultad: 1 });
EjercicioSchema.index({ tipoEjercicio: 1 });
EjercicioSchema.index({ creador: 1 });
EjercicioSchema.index({ arquetipo: 1 });

export default mongoose.model('Ejercicio', EjercicioSchema);
