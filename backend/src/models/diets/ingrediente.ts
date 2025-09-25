import mongoose from 'mongoose';

const IngredienteSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  calorias: { 
    type: Number, 
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return value >= 0 && value <= 10000;
      },
      message: 'Las calorías deben estar entre 0 y 10000 kcal por 100g'
    }
  },
  proteinas: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: function(value: number) {
        return value >= 0 && value <= 100;
      },
      message: 'Las proteínas deben estar entre 0 y 100g por 100g'
    }
  },
  grasas: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: function(value: number) {
        return value >= 0 && value <= 100;
      },
      message: 'Las grasas deben estar entre 0 y 100g por 100g'
    }
  },
  hidratosCarbono: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: function(value: number) {
        return value >= 0 && value <= 100;
      },
      message: 'Los hidratos de carbono deben estar entre 0 y 100g por 100g'
    }
  },
  fuente: {
    type: String,
    required: true,
    enum: ['Interna', 'Openfoodfacts', 'Trabajador']
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  collection: 'ingredientes'
});

// Índices para búsqueda eficiente
IngredienteSchema.index({ nombre: 'text' });
IngredienteSchema.index({ fuente: 1 });

// Validaciones cruzadas para fuente y creador
IngredienteSchema.pre('validate', async function(next) {
  const doc = this as mongoose.Document & {
    fuente: string;
    creador?: mongoose.Types.ObjectId;
  };
  
  // Si fuente es 'Trabajador', debe tener creador
  if (doc.fuente === 'Trabajador' && !doc.creador) {
    return next(new Error('El ingrediente con fuente "Trabajador" debe tener un creador asignado'));
  }
  
  // Si fuente no es 'Trabajador', no debe tener creador
  if (doc.fuente !== 'Trabajador' && doc.creador) {
    return next(new Error('Solo los ingredientes con fuente "Trabajador" pueden tener un creador'));
  }
  
  // Si tiene creador, validar que sea un trabajador nutricionista
  if (doc.creador) {
    try {
      const User = mongoose.model('User');
      const creador = await User.findById(doc.creador);
      
      if (!creador) {
        return next(new Error('El creador especificado no existe'));
      }
      
      if (creador.role !== 'worker') {
        return next(new Error('El creador debe ser un trabajador'));
      }
      
      if (!['Nutricionista', 'Nutricionista y Entrenador personal'].includes(creador.workerType)) {
        return next(new Error('El creador debe ser un nutricionista o nutricionista y entrenador personal'));
      }
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  
  next();
});

export default mongoose.model('Ingrediente', IngredienteSchema);
