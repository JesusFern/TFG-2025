import mongoose from 'mongoose';

const PlatoSchema = new mongoose.Schema({
  orden: { type: Number, required: true },
  nombre: { type: String, required: true },
  receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' }
});

export default PlatoSchema;