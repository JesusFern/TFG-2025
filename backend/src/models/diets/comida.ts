import mongoose from 'mongoose';
import { PlatoSchema } from './plato';

const ComidaSchema = new mongoose.Schema({
  horaEstimada: { type: String},
  platos: [PlatoSchema]
});

export default ComidaSchema;