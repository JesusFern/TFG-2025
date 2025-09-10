import mongoose from 'mongoose';
import User from '../users/user';

const PlanEntrenamientoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  objetivo: { 
    type: String, 
    required: true,
    enum: ['Pérdida de peso', 'Ganancia muscular', 'Mantenimiento', 'Resistencia', 'Flexibilidad', 'Potencia', 'Estabilidad', 'Salud general']
  },
  duracionDias: { type: Number, required: true, min: 1 },
  sesionesPorSemana: { type: Number, required: true, min: 1, max: 7 },
  fechaInicio: { type: Date, required: true },
  diasSemana: [{ type: Number, min: 0, max: 6 }], // 0 = Domingo, 1 = Lunes, etc.
  entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  publico: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
  sesiones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sesion' }]
}, {
  timestamps: true
});

// Middleware para validar que el entrenador es un usuario con rol 'worker'
PlanEntrenamientoSchema.pre('save', async function (next) {
  try {
    const entrenadorUser = await User.findById(this.entrenador);
    if (!entrenadorUser || entrenadorUser.role !== 'worker') {
      return next(new Error('El entrenador debe ser un usuario con rol worker'));
    }

    // Validar que todos los clientes tienen rol 'user'
    if (this.clientes && this.clientes.length > 0) {
      const usuarios = await User.find({ _id: { $in: this.clientes } });
      const noUser = usuarios.find(u => u.role !== 'user');
      if (noUser) {
        return next(new Error('Todos los clientes asignados deben tener rol user'));
      }
    }

    // Validar que las sesiones por semana no excedan la duración
    if (this.sesionesPorSemana > this.duracionDias) {
      return next(new Error('Las sesiones por semana no pueden exceder la duración en días'));
    }

    next();
  } catch (err) {
    next(err as mongoose.CallbackError);
  }
});

// Índices para búsquedas eficientes
PlanEntrenamientoSchema.index({ nombre: 1 });
PlanEntrenamientoSchema.index({ entrenador: 1 });
PlanEntrenamientoSchema.index({ clientes: 1 });
PlanEntrenamientoSchema.index({ publico: 1 });
PlanEntrenamientoSchema.index({ activo: 1 });

export default mongoose.model('PlanEntrenamiento', PlanEntrenamientoSchema);
