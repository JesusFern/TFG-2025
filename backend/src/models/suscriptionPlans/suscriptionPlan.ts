import mongoose from 'mongoose';

export interface SuscriptionPlanDocument extends mongoose.Document {
  nombre: string;
  descripcion: string;
  tipoPrecio: 'Pro';
  tipoPlan: 'Nutricion' | 'Entrenamiento personal' | 'Nutrición y entrenamiento personal';
  precioMensual: number;
  precioTrimestral: number;
  precioAnual: number;
  beneficios: string[];
}

const SuscriptionPlanSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  descripcion: { 
    type: String, 
    required: true,
    trim: true
  },
  tipoPrecio: { 
    type: String, 
    required: true,
    enum: ['Pro']
  },
  tipoPlan: {
    type: String,
    required: true,
    enum: ['Nutricion', 'Entrenamiento personal', 'Nutrición y entrenamiento personal']
  },
  precioMensual: { 
    type: Number, 
    required: true,
    min: 0
  },
  precioTrimestral: { 
    type: Number, 
    required: true,
    min: 0
  },
  precioAnual: { 
    type: Number, 
    required: true,
    min: 0
  },
  beneficios: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Validar que los planes Pro deben tener al menos un precio mayor que 0
SuscriptionPlanSchema.pre('validate', function(next) {
  const plan = this as SuscriptionPlanDocument;
  
  if (plan.precioMensual <= 0 && plan.precioTrimestral <= 0 && plan.precioAnual <= 0) {
    this.invalidate('precioMensual', 'Un plan Pro debe tener al menos un precio mayor que 0');
  }
  
  next();
});

const SuscriptionPlan = mongoose.model<SuscriptionPlanDocument>('SuscriptionPlan', SuscriptionPlanSchema);
export default SuscriptionPlan;
