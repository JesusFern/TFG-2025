import mongoose from 'mongoose';

interface DatosActividadFisicaDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  frecuenciaEjercicio: string;
  tipoEjercicioPractica: string[];
  objetivosPrincipales: string[];
  preferenciasEjercicios: string[];
  limitacionesFisicas: string[];
}

const DatosActividadFisicaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  frecuenciaEjercicio: {
    type: String,
    enum: ['Sedentario', 'Ocasional', 'Regular', 'Frecuente', 'Diario'],
    required: true
  },
  
  tipoEjercicioPractica: [{
    type: String,
    enum: ['Cardio', 'Musculación', 'Deportes de equipo', 'Yoga/Pilates', 'Natación', 'Ciclismo', 'Running', 'Otros'],
    required: true
  }],
  
  objetivosPrincipales: [{
    type: String,
    enum: ['Pérdida de peso', 'Ganancia muscular', 'Resistencia', 'Flexibilidad', 'Salud general', 'Rehabilitación'],
    required: true
  }],
  
  preferenciasEjercicios: [{
    type: String,
    required: false
  }],
  
  limitacionesFisicas: [{
    type: String,
    required: false
  }]
}, { timestamps: true });

// Validación para asegurar que solo usuarios con rol 'user' tienen datos de actividad física
DatosActividadFisicaSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }
    
    if (user.role !== 'user') {
      return next(new Error('Solo los usuarios normales pueden tener datos de actividad física'));
    }
    
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const DatosActividadFisica = mongoose.model<DatosActividadFisicaDocument>('DatosActividadFisica', DatosActividadFisicaSchema);
export default DatosActividadFisica;