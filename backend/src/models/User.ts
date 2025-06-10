import mongoose from 'mongoose';
import { isValidUrl, isValidPhoneNumber } from '../utils/mongoValidators';
import { PasswordService } from '../services/passwordService';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], required: true },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: (value: string | null) => value === null || isValidUrl(value),
      message: 'URL no válida'
    }
  },
  birthDate: { type: Date, required: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: isValidPhoneNumber,
      message: 'Número de teléfono no válido'
    }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });


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

export default mongoose.model('User', UserSchema);