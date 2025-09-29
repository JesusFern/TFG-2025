import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de notificación
export interface NotificacionDocument extends Document {
  usuario: mongoose.Types.ObjectId;
  tipo: 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  leida: boolean;
  enviada: boolean;
  accion?: {
    tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta' | 'abrir_sesion' | 'abrir_dia_dieta';
    url?: string;
    metadata?: Record<string, string | number | boolean>;
  };
  metadata?: {
    mensaje?: mongoose.Types.ObjectId;
    conversacion?: mongoose.Types.ObjectId;
    planEntrenamiento?: mongoose.Types.ObjectId;
    plan?: mongoose.Types.ObjectId;
    dieta?: mongoose.Types.ObjectId;
    sesion?: mongoose.Types.ObjectId;
    cita?: mongoose.Types.ObjectId;
    dia?: number;
    remitente?: mongoose.Types.ObjectId;
  };
  programadaPara?: Date;
  expiraEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de notificación
const NotificacionSchema = new Schema<NotificacionDocument>({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['mensaje', 'sistema', 'recordatorio', 'entrenamiento', 'nutricion'],
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  prioridad: {
    type: String,
    enum: ['baja', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  leida: {
    type: Boolean,
    default: false
  },
  enviada: {
    type: Boolean,
    default: false
  },
  accion: {
    tipo: {
      type: String,
      enum: ['navegar', 'abrir_mensaje', 'abrir_conversacion', 'abrir_plan', 'abrir_dieta']
    },
    url: String,
    metadata: Schema.Types.Mixed
  },
  metadata: {
    mensaje: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mensaje'
    },
    conversacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversacion'
    },
    planEntrenamiento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlanEntrenamiento'
    },
    dieta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dieta'
    },
    sesion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sesion'
    },
    remitente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  programadaPara: {
    type: Date
  },
  expiraEn: {
    type: Date
  }
}, { 
  timestamps: true
});

const Notificacion = mongoose.model<NotificacionDocument>('Notificacion', NotificacionSchema);
export default Notificacion;
