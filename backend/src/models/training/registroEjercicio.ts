import mongoose from 'mongoose';

const RegistroEjercicioSchema = new mongoose.Schema({
  ejercicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicio', required: true },
  sesion: { type: mongoose.Schema.Types.ObjectId, ref: 'Sesion', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cargaUtilizada: { type: Number, min: 0 }, // Peso en kg
  repeticionesRealizadas: { type: Number, required: true, min: 0 },
  seriesCompletadas: { type: Number, required: true, min: 0 },
  nivelEsfuerzo: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 10 
  }, // Escala de 1 a 10
  videoCliente: { type: String }, // URL del video del cliente
  notas: { type: String },
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
RegistroEjercicioSchema.index({ ejercicio: 1 });
RegistroEjercicioSchema.index({ sesion: 1 });
RegistroEjercicioSchema.index({ cliente: 1 });
RegistroEjercicioSchema.index({ fecha: 1 });
RegistroEjercicioSchema.index({ completado: 1 });

export default mongoose.model('RegistroEjercicio', RegistroEjercicioSchema);
