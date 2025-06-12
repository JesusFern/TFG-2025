import mongoose from 'mongoose';
import { isValidUrl, isValidPhoneNumber } from '../../utils/mongoValidators';
import { PasswordService } from '../../services/passwordService';

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
  satisfactionRating?: number;
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
      validator: (value: string | null) => value === null || isValidUrl(value),
      message: 'URL no válida'
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
  satisfactionRating: {
    type: Number,
    min: 0,
    max: 5
  },
  
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
UserSchema.pre('save', function (next) {
  const doc = this as UserDocument;
  
  if (doc.role !== 'user' && (doc.datosSaludYNutricion || doc.datosActividadFisica)) {
    return next(new Error('Solo los usuarios normales pueden tener datos de salud o actividad física'));
  }
  
  if (doc.role !== 'worker' && (doc.workerType || doc.biography || doc.availability)) {
    return next(new Error('Solo los trabajadores pueden tener campos de trabajador'));
  }
  
  if (doc.isNew && doc.role === 'worker' && doc.satisfactionRating === undefined) {
    doc.satisfactionRating = 0;
  }
  
  next();
});

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;