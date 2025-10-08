import mongoose from 'mongoose';

interface DatosSaludYNutricionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  altura: number;
  pesoActual: number;
  objetivoPeso: number;
  condicionesMedicas: string[];
  restriccionesDieteticas: string[];
  alergiasIntolerancias: string[];
  medicacionActual: string[];
  preferenciasAlimentarias: string[];
  horariosComidas: {
    comida: string;
    hora: string;
  }[];
}

const DatosSaludYNutricionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  altura: {
    type: Number,
    required: true,
    min: 50,
    max: 250
  },
  
  pesoActual: {
    type: Number,
    required: true,
    min: 20
  },
  
  objetivoPeso: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  
  condicionesMedicas: [{
    type: String,
    required: false,
    maxlength: [200, 'Cada condición médica no puede exceder los 200 caracteres']
  }],
  
  restriccionesDieteticas: [{
    type: String,
    required: false,
    maxlength: [200, 'Cada restricción dietética no puede exceder los 200 caracteres']
  }],
  
  alergiasIntolerancias: [{
    type: String,
    required: false,
    maxlength: [200, 'Cada alergia o intolerancia no puede exceder los 200 caracteres']
  }],
  
  medicacionActual: [{
    type: String,
    required: false,
    maxlength: [300, 'Cada medicación no puede exceder los 300 caracteres']
  }],
  
  preferenciasAlimentarias: [{
    type: String,
    required: false,
    maxlength: [200, 'Cada preferencia alimentaria no puede exceder los 200 caracteres']
  }],
  
  horariosComidas: [{
    comida: {
      type: String,
      enum: ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Snack'],
      required: true
    },
    hora: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          // Validación de formato de hora (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Formato de hora inválido. Use HH:MM'
      }
    }
  }]
}, { timestamps: true });

// Validación para asegurar que horariosComidas tenga al menos un elemento
DatosSaludYNutricionSchema.pre('validate', function(next) {
  if (!this.horariosComidas || this.horariosComidas.length === 0) {
    this.invalidate('horariosComidas', 'Debe especificar al menos un horario de comida');
  }
  
  next();
});

// Validación para asegurar que solo usuarios con rol 'user' tienen datos de salud y nutrición
DatosSaludYNutricionSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }
    
    if (user.role !== 'user') {
      return next(new Error('Solo los usuarios normales pueden tener datos de salud y nutrición'));
    }

    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const DatosSaludYNutricion = mongoose.model<DatosSaludYNutricionDocument>('DatosSaludYNutricion', DatosSaludYNutricionSchema);
export default DatosSaludYNutricion;