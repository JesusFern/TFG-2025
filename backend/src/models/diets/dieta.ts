import mongoose from 'mongoose';
import DiaDietaSchema from './diaDieta';
import User from '../users/user';
import { TIPOS_DIETA } from '../../constants/dietTypes';


const DietaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  tipo: [{ 
    type: String, 
    required: true,
    enum: TIPOS_DIETA
  }],
  duracion: { type: Number },
  comidasDiarias: { type: Number, required: true },
  dias: [DiaDietaSchema],
  fechaInicio: { type: Date, required: true },
  creador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false
  },
  asignadaA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  draftMode: { type: Boolean, default: true },
  publica: { type: Boolean, default: false }

});

// Middleware para validar que el creador es un usuario con rol 'worker' y los asignados son 'user'
DietaSchema.pre('save', async function (next) {
  try {
    // Si es dieta pública, no validar creador
    if (this.publica) {
      return next();
    }

    // Validar que existe creador para dietas no públicas
    if (!this.creador) {
      return next(new Error('El creador es requerido para dietas no públicas'));
    }

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

      // Validar que los clientes asignados estén en la lista de clientes del trabajador
      if (creadorUser.clientesAsignados && creadorUser.clientesAsignados.length > 0) {
        const clientesAsignadosIds = creadorUser.clientesAsignados
          .filter(cliente => cliente.tipoAsignacion === 'Nutricionista')
          .map(cliente => cliente.clienteId.toString());
        
        // Verificar cada cliente asignado
        for (const clienteId of this.asignadaA) {
          const clienteIdString = typeof clienteId === 'object' && clienteId._id 
            ? clienteId._id.toString() 
            : clienteId.toString();
            
          if (!clientesAsignadosIds.includes(clienteIdString)) {
            return next(new Error(
              `El cliente ${clienteIdString} no está asignado a este nutricionista`
            ));
          }
        }
      } else {
        return next(new Error('El trabajador no tiene clientes asignados como nutricionista'));
      }
    }

    next();
  } catch (err) {
    next(err as mongoose.CallbackError);
  }
});

export default mongoose.model('Dieta', DietaSchema);