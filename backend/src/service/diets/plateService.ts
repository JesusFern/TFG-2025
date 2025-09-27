import Dieta from '../../models/diets/dieta';
import mongoose from 'mongoose';
import Receta from '../../models/diets/receta';
import { actualizarNutricionDia } from '../../helpers/calculoNutricionalHelper';

type PlatoUpdate = {
  _id: string;
  nombre?: string;
  orden?: number;
  receta?: string;
  ingredientesPersonalizados?: Array<{
    ingrediente: string;
    peso: number;
  }>;
};

interface NotFoundError extends Error {
  status?: number;
}

export async function actualizarPlatosService(platos: PlatoUpdate[]) {
  if (!Array.isArray(platos) || platos.length === 0) {
    throw new Error('Debes enviar una lista de platos a actualizar');
  }

  const actualizados: Array<unknown> = [];
  const diasActualizados = new Set<number>(); // Para rastrear qué días necesitan recálculo

  for (const plato of platos) {
    if (!plato._id) continue;

    const dieta = await Dieta.findOne({ 'dias.comidas.platos._id': plato._id });
    if (!dieta) continue;

    let platoActualizado = null;
    let diaIndex = -1;
    
    for (let d = 0; d < dieta.dias.length; d++) {
      const dia = dieta.dias[d];
      for (const comida of dia.comidas) {
        const subPlato = comida.platos.id(plato._id);
        if (subPlato) {
          if (typeof plato.nombre !== 'undefined') subPlato.nombre = plato.nombre;
          if (typeof plato.orden !== 'undefined') subPlato.orden = plato.orden;
          if (typeof plato.receta !== 'undefined' && plato.receta && plato.receta !== '') {
            // Validar que el ID de la receta sea válido
            if (!mongoose.Types.ObjectId.isValid(plato.receta)) {
              const error: NotFoundError = new Error(`ID de receta inválido: ${plato.receta}`);
              error.status = 400;
              throw error;
            }
            
            const recetaExiste = await Receta.findById(plato.receta);
            if (!recetaExiste) {
              const error: NotFoundError = new Error(`No se encontró la receta con el id: ${plato.receta}`);
              error.status = 404;
              throw error;
            }
            subPlato.receta = new mongoose.Types.ObjectId(plato.receta);
          } else if (plato.receta === null || plato.receta === '') {
            // Si se envía null o string vacío, eliminar la receta
            subPlato.receta = undefined;
          }
          if (typeof plato.ingredientesPersonalizados !== 'undefined') {
            // Limpiar ingredientes existentes usando el método de Mongoose
            subPlato.ingredientesPersonalizados.splice(0, subPlato.ingredientesPersonalizados.length);
            // Añadir los nuevos ingredientes uno por uno
            for (const ing of plato.ingredientesPersonalizados) {
              // Validar que el ingrediente tenga un ID válido
              if (ing.ingrediente && mongoose.Types.ObjectId.isValid(ing.ingrediente)) {
                subPlato.ingredientesPersonalizados.push({
                  ingrediente: new mongoose.Types.ObjectId(ing.ingrediente),
                  peso: ing.peso
                });
              } else {
                console.warn(`Ingrediente con ID inválido omitido: ${ing.ingrediente}`);
              }
            }
          }
          platoActualizado = subPlato;
          diaIndex = d;
          break;
        }
      }
      if (platoActualizado) break;
    }
    
    if (platoActualizado && diaIndex !== -1) {
      await dieta.save();
      actualizados.push(platoActualizado);
      diasActualizados.add(diaIndex);
    }
  }

  if (actualizados.length === 0) {
    const ids = platos.map(p => p._id).join(', ');
    const error: NotFoundError = new Error(`No se encontró ningún plato con los ids: ${ids}`);
    error.status = 404;
    throw error;
  }

  // Recalcular las calorías y macronutrientes para todos los días que fueron modificados
  for (const diaIndex of diasActualizados) {
    const dieta = await Dieta.findOne({ 'dias.comidas.platos._id': { $in: platos.map(p => p._id) } });
    if (dieta) {
      await actualizarNutricionDia(dieta, diaIndex);
    }
  }

  return actualizados;
}