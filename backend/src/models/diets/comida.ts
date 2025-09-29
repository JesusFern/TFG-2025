import mongoose from 'mongoose';
import { PlatoSchema } from './plato';

const ComidaSchema = new mongoose.Schema({
  horaEstimada: { type: String},
  nombreComida: { type: String},
  platos: [PlatoSchema]
}, { timestamps: true });

export default ComidaSchema;