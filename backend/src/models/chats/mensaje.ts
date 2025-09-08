import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de mensaje
export interface MensajeDocument extends Document {
  remitente: mongoose.Types.ObjectId;
  destinatario: mongoose.Types.ObjectId;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'archivo' | 'sistema';
  estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamano: number;
  }>;
  metadata?: {
    planEntrenamiento?: mongoose.Types.ObjectId;
    dieta?: mongoose.Types.ObjectId;
    sesion?: mongoose.Types.ObjectId;
    tags?: string[];
  };
  respuestaA?: mongoose.Types.ObjectId;
  programadoPara?: Date;
  expiraEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de mensaje
const MensajeSchema = new Schema<MensajeDocument>({
  remitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  tipo: {
    type: String,
    enum: ['texto', 'imagen', 'archivo', 'sistema'],
    default: 'texto'
  },
  estado: {
    type: String,
    enum: ['enviado', 'entregado', 'leido', 'archivado'],
    default: 'enviado'
  },
  prioridad: {
    type: String,
    enum: ['baja', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  categoria: {
    type: String,
    enum: ['general', 'entrenamiento', 'nutricion', 'consulta', 'recordatorio'],
    default: 'general'
  },
  adjuntos: [{
    nombre: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      required: true
    },
    tamano: {
      type: Number,
      required: true
    }
  }],
  metadata: {
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
    tags: [String]
  },
  respuestaA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mensaje'
  },
  programadoPara: {
    type: Date
  },
  expiraEn: {
    type: Date
  }
}, { 
  timestamps: true
});

const Mensaje = mongoose.model<MensajeDocument>('Mensaje', MensajeSchema);
export default Mensaje;
