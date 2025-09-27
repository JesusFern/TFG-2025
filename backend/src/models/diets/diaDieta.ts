import mongoose from 'mongoose';
import ComidaSchema from './comida';

const DiaDietaSchema = new mongoose.Schema({
  caloriasTotales: { type: Number, min: 0 },
  proteinas: { type: Number, min: 0 },
  hidratosCarbono: { type: Number, min: 0 },
  grasas: { type: Number, min: 0 },
  numeroComidas: { type: Number },
  cumplimiento: { type: Boolean },
  comidas: [ComidaSchema]
});

export default DiaDietaSchema;