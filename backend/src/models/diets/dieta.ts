import mongoose from 'mongoose';
import DiaDietaSchema from './diaDieta';
import User from '../users/user';


const DietaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  tipo: [{ type: String, required: true }],
  duracion: { type: Number },
  dias: [DiaDietaSchema],
  fechaInicio: { type: Date, required: true },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asignadaA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
});

// Middleware para validar que el creador es un usuario con rol 'worker' y los asignados son 'user'
DietaSchema.pre('save', async function (next) {
  try {
    const creadorUser = await User.findById(this.creador);
    if (!creadorUser || creadorUser.role !== 'worker') {
      return next(new Error('El creador debe ser un usuario con rol worker'));
    }

    if (this.asignadaA && this.asignadaA.length > 0) {
      const usuarios = await User.find({ _id: { $in: this.asignadaA } });
      const noUser = usuarios.find(u => u.role !== 'user');
      if (noUser) {
        return next(new Error('Todos los usuarios asignados deben tener rol user'));
      }
    }

    next();
  } catch (err) {
    next(err as mongoose.CallbackError);
  }
});

export default mongoose.model('Dieta', DietaSchema);