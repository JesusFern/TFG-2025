import mongoose from 'mongoose';
import { isValidUrl, isValidPhoneNumber } from '../utils/mongoValidators';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], required: true },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: isValidUrl,
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

export default mongoose.model('User', UserSchema);