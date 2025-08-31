import Dieta from '../../models/diets/dieta';
import mongoose from 'mongoose';
import Receta from '../../models/diets/receta';


type PlatoUpdate = {
  _id: string;
  nombre?: string;
  orden?: number;
  receta?: string;
};

interface NotFoundError extends Error {
  status?: number;
}

export async function actualizarPlatosService(platos: PlatoUpdate[]) {
  if (!Array.isArray(platos) || platos.length === 0) {
    throw new Error('Debes enviar una lista de platos a actualizar');
  }

  const actualizados: Array<unknown> = [];

  for (const plato of platos) {
    if (!plato._id) continue;

    const dieta = await Dieta.findOne({ 'dias.comidas.platos._id': plato._id });
    if (!dieta) continue;

    let platoActualizado = null;
    for (const dia of dieta.dias) {
      for (const comida of dia.comidas) {
        const subPlato = comida.platos.id(plato._id);
        if (subPlato) {
          if (typeof plato.nombre !== 'undefined') subPlato.nombre = plato.nombre;
          if (typeof plato.orden !== 'undefined') subPlato.orden = plato.orden;
          if (typeof plato.receta !== 'undefined') {
            const recetaExiste = await Receta.findById(plato.receta);
            if (!recetaExiste) {
              const error: NotFoundError = new Error(`No se encontró la receta con el id: ${plato.receta}`);
              error.status = 404;
              throw error;
            }
            subPlato.receta = new mongoose.Types.ObjectId(plato.receta);
          }
          platoActualizado = subPlato;
        }
      }
    }
    if (platoActualizado) {
      await dieta.save();
      actualizados.push(platoActualizado);
    }
  }

  if (actualizados.length === 0) {
    const ids = platos.map(p => p._id).join(', ');
    const error: NotFoundError = new Error(`No se encontró ningún plato con los ids: ${ids}`);
    error.status = 404;
    throw error;
  }

  return actualizados;
}