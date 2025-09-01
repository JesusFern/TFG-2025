import mongoose from 'mongoose';
import ComidaSchema from './comida';

const DiaDietaSchema = new mongoose.Schema({
  caloriasTotales: { type: Number },
  macronutrientes: { type: String },
  micronutrientes: { type: String },
  numeroComidas: { type: Number },
  requerimientosHidratacion: { type: String },
  cumplimiento: { type: Boolean },
  comidas: [ComidaSchema]
});

export default DiaDietaSchema;