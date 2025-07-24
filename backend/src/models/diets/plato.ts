import mongoose from 'mongoose';

export const PlatoSchema = new mongoose.Schema({
  orden: { type: Number, required: true },
  nombre: { type: String },
  receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' }
});

export default mongoose.model('Plato', PlatoSchema);