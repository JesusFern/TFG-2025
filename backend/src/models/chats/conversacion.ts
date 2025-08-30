import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de conversación
export interface ConversacionDocument extends Document {
  participantes: mongoose.Types.ObjectId[];
  ultimoMensaje?: mongoose.Types.ObjectId;
  ultimoMensajeContenido?: string;
  ultimoMensajeFecha?: Date;
  ultimoMensajeRemitente?: mongoose.Types.ObjectId;
  mensajesNoLeidos: Map<string, number>;
  activa: boolean;
  metadata?: {
    planEntrenamiento?: mongoose.Types.ObjectId;
    dieta?: mongoose.Types.ObjectId;
    tipo: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
    tags?: string[];
  };
  configuracion?: {
    notificaciones: boolean;
    sonido: boolean;
    recordatorios: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de conversación
const ConversacionSchema = new Schema<ConversacionDocument>({
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  ultimoMensaje: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mensaje'
  },
  ultimoMensajeContenido: {
    type: String,
    maxlength: 100
  },
  ultimoMensajeFecha: {
    type: Date
  },
  ultimoMensajeRemitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mensajesNoLeidos: {
    type: Map,
    of: Number,
    default: new Map()
  },
  activa: {
    type: Boolean,
    default: true
  },
  metadata: {
    planEntrenamiento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlanEntrenamiento'
    },
    dieta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dieta'
    },
    tipo: {
      type: String,
      enum: ['general', 'entrenamiento', 'nutricion', 'consulta'],
      default: 'general'
    },
    tags: [String]
  },
  configuracion: {
    notificaciones: {
      type: Boolean,
      default: true
    },
    sonido: {
      type: Boolean,
      default: true
    },
    recordatorios: {
      type: Boolean,
      default: true
    }
  }
}, { 
  timestamps: true
});

const Conversacion = mongoose.model<ConversacionDocument>('Conversacion', ConversacionSchema);
export default Conversacion;
