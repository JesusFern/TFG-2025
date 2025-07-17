import mongoose from 'mongoose';

const RecetaSchema = new mongoose.Schema({
  nombreReceta: { type: String, required: true },
  ingredientes: [{ type: String, required: true }],
  pasosPreparacion: [{ type: String }],
  tiempoPreparacion: { type: String },
  informacionNutricional: { type: String },
  imagen: { type: String }
});

export default mongoose.model('Receta', RecetaSchema);