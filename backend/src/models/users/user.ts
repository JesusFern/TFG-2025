import mongoose from 'mongoose';
import { isValidUrl, isValidPhoneNumber } from '../../utils/mongoValidators';
import { PasswordService } from '../../utils/passwordService';

interface UserDocument extends mongoose.Document {
  // ===== CAMPOS BÁSICOS (TODOS LOS ROLES) =====
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'admin' | 'worker' | 'user';
  
  // ===== CAMPOS COMPARTIDOS (USER Y WORKER) =====
  gender?: string;
  birthDate?: Date;
  profilePicture?: string | null;
  
  // ===== CAMPOS ESPECÍFICOS DE TRABAJADOR (role: 'worker') =====
  workerType?: string;
  biography?: string;
  availability?: string;
  isWorkerAvailable?: boolean;
  satisfactionRating?: number;
  clientesAsignados?: Array<{
    clienteId: mongoose.Types.ObjectId;
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  }>;
  
  // ===== CAMPOS ESPECÍFICOS DE USUARIO (role: 'user') =====
  datosSaludYNutricion?: mongoose.Types.ObjectId;
  datosActividadFisica?: mongoose.Types.ObjectId;
  suscripcion?: mongoose.Types.ObjectId;
  
  // ===== CAMPOS DE GOOGLE CALENDAR =====
  google?: {
    refreshToken?: string;
    accessToken?: string;
    tokenExpiry?: Date;
    calendarConnected?: boolean;
  };
  
  // ===== CAMPOS DEL SISTEMA =====
  isNew: boolean;
}

const UserSchema = new mongoose.Schema({
  // ===== CAMPOS BÁSICOS (TODOS LOS ROLES) =====
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, validate: { validator: isValidPhoneNumber, message: 'Número de teléfono no válido' }},
  role: { type: String, enum: ['admin', 'worker', 'user'], default: 'user' },
  
  // ===== CAMPOS COMPARTIDOS (USER Y WORKER) =====
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
  
  // ===== CAMPOS ESPECÍFICOS DE TRABAJADOR (role: 'worker') =====
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
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tipoAsignacion: {
      type: String,
      enum: ['Nutricionista', 'Entrenador personal'],
      required: true
    }
  }],
  
  // ===== CAMPOS ESPECÍFICOS DE USUARIO (role: 'user') =====
  datosSaludYNutricion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatosSaludYNutricion'
  },
  datosActividadFisica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatosActividadFisica'
  },
  suscripcion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSuscription'
  },
  
  // ===== CAMPOS DE GOOGLE CALENDAR =====
  google: {
    refreshToken: { type: String },
    accessToken: { type: String },
    tokenExpiry: { type: Date },
    calendarConnected: { type: Boolean, default: false }
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

// ===== VALIDACIONES SEGÚN EL ROL =====
UserSchema.pre('validate', function (next) {
  const doc = this as UserDocument;
  
  // Validaciones para USUARIOS NORMALES (role: 'user')
  // Campos obligatorios: gender, birthDate
  if (doc.role === 'user') {
    if (!doc.gender) {
      this.invalidate('gender', 'El género es obligatorio para usuarios');
    }
    if (!doc.birthDate) {
      this.invalidate('birthDate', 'La fecha de nacimiento es obligatoria para usuarios');
    }
  }
  
  // Validaciones para TRABAJADORES (role: 'worker')
  // Campos obligatorios: workerType, biography, availability, birthDate
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

// ===== INICIALIZACIÓN DE CAMPOS POR ROL =====
// Inicializar valor de satisfacción para trabajadores nuevos
UserSchema.pre('save', function (next) {
  const doc = this as UserDocument;
  
  if (doc.isNew && doc.role === 'worker' && doc.satisfactionRating === undefined) {
    doc.satisfactionRating = 0;
  }
  
  next();
});

// ===== VALIDACIÓN DE CONSISTENCIA DE DATOS SEGÚN EL ROL =====
UserSchema.pre('save', async function (next) {
  const doc = this as UserDocument;
  
  // Limpiar campos de TRABAJADOR si el rol es admin o user
  if (doc.role === 'admin' || doc.role === 'user') {
    doc.clientesAsignados = undefined;
    doc.workerType = undefined;
    doc.biography = undefined;
    doc.availability = undefined;
    doc.isWorkerAvailable = undefined;
  }

  // Solo USUARIOS pueden tener datos de salud, actividad física o suscripciones
  if (doc.role !== 'user' && (doc.datosSaludYNutricion || doc.datosActividadFisica || doc.suscripcion)) {
    return next(new Error('Solo los usuarios normales pueden tener datos de salud, actividad física o suscripciones'));
  }
  
  // Solo TRABAJADORES pueden tener campos específicos de trabajador
  if (doc.role !== 'worker' && (doc.workerType || doc.biography || doc.availability || doc.isWorkerAvailable !== undefined)) {
    return next(new Error('Solo los trabajadores pueden tener campos de trabajador'));
  }
  
  // Validar que los clientes asignados sean usuarios con rol 'user'
  if (doc.clientesAsignados && doc.clientesAsignados.length > 0) {
    try {
      const User = mongoose.model('User');
      const clientesIds = doc.clientesAsignados.map(cliente => cliente.clienteId);
      const clientesIdsUnicos = Array.from(new Set(clientesIds)); // Eliminar duplicados
      const clientes = await User.find({ _id: { $in: clientesIdsUnicos } });
      
      // Verificar que todos los IDs encontrados corresponden a usuarios con rol 'user'
      const clientesInvalidos = clientes.filter(cliente => cliente.role !== 'user');
      
      if (clientesInvalidos.length > 0) {
        return next(new Error('Solo se pueden asignar usuarios con rol "user" como clientes'));
      }
      
      // Limpiar automáticamente los IDs de clientes que no existen
      const clientesEncontrados = clientes.map(c => c._id.toString());
      const clientesNoEncontrados = clientesIdsUnicos.filter(id => !clientesEncontrados.includes(id));
      
      if (clientesNoEncontrados.length > 0) {
        console.warn('Limpiando IDs de clientes que no existen:', clientesNoEncontrados);
        
        // Filtrar clientesAsignados para mantener solo los que existen
        doc.clientesAsignados = doc.clientesAsignados.filter(cliente => 
          clientesEncontrados.includes(cliente.clienteId)
        );
        
        console.log(`Se eliminaron ${clientesNoEncontrados.length} referencias de clientes inexistentes`);
      }
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  
  next();
});

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;