import mongoose from 'mongoose';

const RegistroEjercicioSchema = new mongoose.Schema({
  ejercicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicio', required: true },
  sesion: { type: mongoose.Schema.Types.ObjectId, ref: 'Sesion', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cargaUtilizada: { type: Number, min: 0 },
  repeticionesRealizadas: { type: Number, required: true, min: 0 },
  seriesCompletadas: { type: Number, required: true, min: 0 },
  nivelEsfuerzo: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 10 
  },
  videoCliente: { type: String },
  notas: { type: String },
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
  // Campos adicionales para mejor seguimiento
  tiempoDescanso: { type: Number, min: 0 }, // Tiempo de descanso entre series en segundos
  duracionEjercicio: { type: Number, min: 0 }, // Duración total del ejercicio en segundos
  ordenEnSesion: { type: Number, min: 1 } // Orden del ejercicio en la sesión
}, {
  timestamps: true
});

RegistroEjercicioSchema.index({ ejercicio: 1 });
RegistroEjercicioSchema.index({ sesion: 1 });
RegistroEjercicioSchema.index({ cliente: 1 });
RegistroEjercicioSchema.index({ fecha: 1 });
RegistroEjercicioSchema.index({ completado: 1 });
// Índices compuestos para consultas frecuentes
RegistroEjercicioSchema.index({ sesion: 1, cliente: 1 });
RegistroEjercicioSchema.index({ sesion: 1, ejercicio: 1 });
RegistroEjercicioSchema.index({ cliente: 1, fecha: 1 });

export default mongoose.model('RegistroEjercicio', RegistroEjercicioSchema);
