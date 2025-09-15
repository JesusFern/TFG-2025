import Receta from '../../models/diets/receta';
import mongoose from 'mongoose';

export interface CrearRecetaData {
  nombreReceta: string;
  ingredientes: string[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  informacionNutricional?: string;
  imagenes?: string[];
  publica: boolean | string;
  creadorId: string;
}

export async function crearRecetaService(datosReceta: CrearRecetaData) {
  if (typeof datosReceta.publica === 'string') {
    datosReceta.publica = datosReceta.publica === 'true';
  }

  const receta = new Receta({
    nombreReceta: datosReceta.nombreReceta.trim(),
    ingredientes: datosReceta.ingredientes.map(ingrediente => ingrediente.trim()),
    pasosPreparacion: datosReceta.pasosPreparacion?.map(paso => paso.trim()) || [],
    tiempoPreparacion: datosReceta.tiempoPreparacion?.trim() || '',
    informacionNutricional: datosReceta.informacionNutricional?.trim() || '',
    imagenes: datosReceta.imagenes || [],
    publica: datosReceta.publica,
    creador: datosReceta.creadorId ? new mongoose.Types.ObjectId(datosReceta.creadorId) : undefined
  });

  await receta.save();
  return receta;
}

export async function obtenerRecetaService(recetaId: string) {
  const receta = await Receta.findById(recetaId);
  
  if (!receta) {
    const error = new Error('Receta no encontrada');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  return receta;
}

export async function obtenerRecetasService() {
  const recetas = await Receta.find().sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasService() {
  const recetas = await Receta.find({ publica: true }).sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerMisRecetasService(creadorId: string) {
  const recetas = await Receta.find({ creador: creadorId }).sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasYPropiasService(creadorId: string) {
  const recetas = await Receta.find({
    $or: [
      { publica: true },
      { creador: creadorId }
    ]
  }).sort({ nombreReceta: 1 });
  return recetas;
}
