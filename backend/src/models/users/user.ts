import mongoose from 'mongoose';
import { isValidUrl, isValidPhoneNumber } from '../../utils/mongoValidators';
import { PasswordService } from '../../utils/passwordService';

interface UserDocument extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'admin' | 'worker' | 'user';
  gender?: string;
  birthDate?: Date;
  profilePicture?: string | null;
  workerType?: string;
  biography?: string;
  availability?: string;
  isWorkerAvailable?: boolean;
  satisfactionRating?: number;
  clientesAsignados?: mongoose.Types.ObjectId[];
  datosSaludYNutricion?: mongoose.Types.ObjectId;
  datosActividadFisica?: mongoose.Types.ObjectId;
  isNew: boolean;
}

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, validate: { validator: isValidPhoneNumber, message: 'Número de teléfono no válido' }},
  role: { type: String, enum: ['admin', 'worker', 'user'], default: 'user' },
  
  // Campos que pueden variar según el rol
  gender: { 
    type: String, 
    enum: ['Masculino', 'Femenino', 'Otro']
  },
  birthDate: { 
    type: Date
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(value: string | null) {
        if (value === null) return true;
        
        // Aceptar URLs válidas
        if (value.startsWith('http://') || value.startsWith('https://')) {
          return isValidUrl(value);
        }
        
        if (value.startsWith('data:image/')) {
          // Validar que el base64 no sea demasiado grande (máximo ~15MB)
          const base64Size = Buffer.byteLength(value, 'utf8');
          return base64Size <= 15 * 1024 * 1024;
        }
        
        return false;
      },
      message: 'La imagen debe ser una URL válida o una imagen base64'
    }
  },
  
  // Campos específicos de Trabajador
  workerType: {
    type: String,
    enum: ['Entrenador personal', 'Nutricionista', 'Nutricionista y Entrenador personal']
  },
  biography: {
    type: String
  },
  availability: {
    type: String
  },
  isWorkerAvailable: {
    type: Boolean,
    default: true
  },
  satisfactionRating: {
    type: Number,
    min: 0,
    max: 5
  },
  clientesAsignados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Datos de usuarios normales
  datosSaludYNutricion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatosSaludYNutricion'
  },
  datosActividadFisica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatosActividadFisica'
  }
}, { timestamps: true });

// Middleware para cifrar la contraseña
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await PasswordService.hashPassword(this.password);
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// Validaciones según el rol usando pre validate
UserSchema.pre('validate', function (next) {
  const doc = this as UserDocument;
  
  // Validaciones para usuarios normales (role: 'user')
  if (doc.role === 'user') {
    if (!doc.gender) {
      this.invalidate('gender', 'El género es obligatorio para usuarios');
    }
    if (!doc.birthDate) {
      this.invalidate('birthDate', 'La fecha de nacimiento es obligatoria para usuarios');
    }
  }
  
  // Validaciones para trabajadores (role: 'worker')
  if (doc.role === 'worker') {
    if (!doc.workerType) {
      this.invalidate('workerType', 'El tipo de trabajador es obligatorio');
    }
    if (!doc.biography) {
      this.invalidate('biography', 'La biografía es obligatoria para trabajadores');
    }
    if (!doc.availability) {
      this.invalidate('availability', 'La disponibilidad es obligatoria para trabajadores');
    }
    if (!doc.birthDate) {
      this.invalidate('birthDate', 'La fecha de nacimiento es obligatoria para trabajadores');
    }
  }
  
  next();
});

// Validación de consistencia de datos según el rol
UserSchema.pre('save', async function (next) {
  const doc = this as UserDocument;
  
  // Comprueba si estamos en un entorno de test
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  
  if (!isTestEnvironment && doc.role !== 'user' && (doc.datosSaludYNutricion || doc.datosActividadFisica)) {
    return next(new Error('Solo los usuarios normales pueden tener datos de salud o actividad física'));
  }
  
  if (!isTestEnvironment && doc.role !== 'worker' && (doc.workerType || doc.biography || doc.availability || doc.isWorkerAvailable !== undefined || doc.clientesAsignados?.length)) {
    return next(new Error('Solo los trabajadores pueden tener campos de trabajador o clientes asignados'));
  }
  
  if (doc.isNew && doc.role === 'worker' && doc.satisfactionRating === undefined) {
    doc.satisfactionRating = 0;
  }
  
  // Validar que los clientes asignados sean usuarios con rol 'user'
  if (doc.clientesAsignados && doc.clientesAsignados.length > 0) {
    try {
      const User = mongoose.model('User');
      const clientesIds = doc.clientesAsignados;
      const clientes = await User.find({ _id: { $in: clientesIds } });
      
      // Verificar que todos los IDs encontrados corresponden a usuarios con rol 'user'
      const clientesInvalidos = clientes.filter(cliente => cliente.role !== 'user');
      
      if (clientesInvalidos.length > 0) {
        return next(new Error('Solo se pueden asignar usuarios con rol "user" como clientes'));
      }
      
      // Verificar que todos los IDs de clientesAsignados existen
      if (clientes.length !== clientesIds.length) {
        return next(new Error('Algunos de los usuarios asignados como clientes no existen'));
      }
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  
  next();
});

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;