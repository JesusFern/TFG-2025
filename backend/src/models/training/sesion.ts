import mongoose from 'mongoose';

const EjercicioSesionSchema = new mongoose.Schema({
  ejercicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicio', required: true },
  orden: { type: Number, required: true, min: 1 },
  series: { type: Number, required: true, min: 1 },
  repeticiones: { type: Number, required: true, min: 1 },
  peso: { type: Number, min: 0 },
  tiempoDescanso: { type: Number, required: true, min: 0 },
  nivelIntensidad: { 
    type: String, 
    required: true,
    enum: ['Baja', 'Media', 'Alta'],
    default: 'Media'
  },
  ejerciciosAlternativos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicio' }],
  opcionesProgresion: {
    aumentarPeso: { type: Boolean, default: false },
    masRepeticiones: { type: Boolean, default: false },
    mayorIntensidad: { type: Boolean, default: false }
  }
});

const SesionSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  hora: { type: String },
  tipoEntrenamiento: { 
    type: String, 
    required: true,
    enum: ['Fuerza', 'Resistencia', 'Cardio', 'HIIT', 'Movilidad', 'Flexibilidad', 'Potencia', 'Estabilidad']
  },
  duracion: { type: Number, required: true, min: 1 },
  ejercicios: [EjercicioSesionSchema],
  completada: { type: Boolean, default: false },
  notas: { type: String },
  entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

SesionSchema.index({ fecha: 1 });
SesionSchema.index({ entrenador: 1 });
SesionSchema.index({ cliente: 1 });
SesionSchema.index({ completada: 1 });

export default mongoose.model('Sesion', SesionSchema);
