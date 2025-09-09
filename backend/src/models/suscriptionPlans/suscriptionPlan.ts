import mongoose from 'mongoose';

export interface SuscriptionPlanDocument extends mongoose.Document {
  nombre: string;
  descripcion: string;
  tipoPrecio: 'Gratuito' | 'Básico' | 'Pro';
  tipoPlan: 'Nutricion' | 'Entrenamiento personal' | 'Nutrición y entrenamiento personal' | null;
  precioMensual: number;
  precioTrimestral: number;
  precioAnual: number;
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
    enum: ['Gratuito', 'Básico', 'Pro']
  },
  tipoPlan: {
    type: String,
    enum: ['Nutricion', 'Entrenamiento personal', 'Nutrición y entrenamiento personal'],
    default: null,
    validate: {
      validator: function(value: string | null) {
        return value === null || ['Nutricion', 'Entrenamiento personal', 'Nutrición y entrenamiento personal'].includes(value);
      },
      message: 'tipoPlan debe ser null o uno de los valores permitidos'
    }
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
  }
}, { timestamps: true });

// Validar que si el plan es gratuito, todos los precios sean 0
SuscriptionPlanSchema.pre('validate', function(next) {
  const plan = this as SuscriptionPlanDocument;
  
  if (plan.tipoPrecio === 'Gratuito') {
    if (plan.precioMensual !== 0) {
      this.invalidate('precioMensual', 'Un plan gratuito debe tener precio mensual 0');
    }
    if (plan.precioTrimestral !== 0) {
      this.invalidate('precioTrimestral', 'Un plan gratuito debe tener precio trimestral 0');
    }
    if (plan.precioAnual !== 0) {
      this.invalidate('precioAnual', 'Un plan gratuito debe tener precio anual 0');
    }
  } else {
    // Planes de pago deben tener al menos un precio mayor que 0
    if (plan.precioMensual <= 0 && plan.precioTrimestral <= 0 && plan.precioAnual <= 0) {
      this.invalidate('precioMensual', 'Un plan de pago debe tener al menos un precio mayor que 0');
    }
  }
  
  next();
});

// Validar relación entre tipoPrecio y tipoPlan
SuscriptionPlanSchema.pre('validate', function(next) {
  const plan = this as SuscriptionPlanDocument;
  
  // Validar que solo el plan gratuito puede tener tipoPlan a null
  if (plan.tipoPrecio === 'Gratuito' && plan.tipoPlan !== null) {
    this.invalidate('tipoPlan', 'El plan gratuito debe tener tipoPlan como null');
  }
  
  // Validar que los planes de pago deben tener un tipoPlan válido
  if (plan.tipoPrecio !== 'Gratuito' && plan.tipoPlan === null) {
    this.invalidate('tipoPlan', 'Los planes de pago deben tener un tipoPlan válido');
  }
  
  next();
});

const SuscriptionPlan = mongoose.model<SuscriptionPlanDocument>('SuscriptionPlan', SuscriptionPlanSchema);
export default SuscriptionPlan;
