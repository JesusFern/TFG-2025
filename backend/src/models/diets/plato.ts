import mongoose from 'mongoose';

const PlatoSchema = new mongoose.Schema({
  orden: { type: Number, required: true },
  nombre: { type: String },
  receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' }
});

export default PlatoSchema;