import mongoose from 'mongoose';
import PlatoSchema from './plato';

const ComidaSchema = new mongoose.Schema({
  horaEstimada: { type: String, required: true },
  platos: [PlatoSchema]
});

export default ComidaSchema;