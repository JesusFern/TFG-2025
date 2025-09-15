import mongoose from 'mongoose';

const RecetaSchema = new mongoose.Schema({
  nombreReceta: { type: String, required: true },
  ingredientes: [{ type: String, required: true }],
  pasosPreparacion: [{ type: String }],
  tiempoPreparacion: { type: String },
  informacionNutricional: { type: String },
  imagenes: [{ 
    type: String,
    default: ''
  }],
  creador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
  publica: { type: Boolean, required: true }
});

export default mongoose.model('Receta', RecetaSchema);