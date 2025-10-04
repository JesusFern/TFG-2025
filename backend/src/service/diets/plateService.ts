import Dieta from '../../models/diets/dieta';
import mongoose from 'mongoose';
import Receta from '../../models/diets/receta';
import { actualizarNutricionDia } from '../../helpers/calculoNutricionalHelper';

type PlatoUpdate = {
  _id?: string; // ID del plato (si existe como subdocumento)
  dietaId: string; // ID de la dieta (REQUERIDO)
  diaIndex: number; // Índice del día (REQUERIDO)
  comidaIndex: number; // Índice de la comida (REQUERIDO)
  platoIndex: number; // Índice del plato (REQUERIDO)
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

  console.log('🚀 INICIO actualizarPlatosService:', {
    platosRecibidos: platos.map(p => ({
      _id: p._id,
      dietaId: p.dietaId,
      diaIndex: p.diaIndex,
      comidaIndex: p.comidaIndex,
      platoIndex: p.platoIndex,
      nombre: p.nombre,
      ingredientesPersonalizados: p.ingredientesPersonalizados
    }))
  });

  const actualizados: unknown[] = [];
  const diasActualizados = new Set<number>();

  for (const plato of platos) {
    // Validar que tenemos todos los datos necesarios
    if (!plato.dietaId || typeof plato.diaIndex !== 'number' || typeof plato.comidaIndex !== 'number' || typeof plato.platoIndex !== 'number') {
      console.warn('❌ Plato sin datos requeridos, omitiendo:', {
        dietaId: plato.dietaId,
        diaIndex: plato.diaIndex,
        comidaIndex: plato.comidaIndex,
        platoIndex: plato.platoIndex
      });
      continue;
    }

    // Buscar la dieta por ID
    const dieta = await Dieta.findById(plato.dietaId);
    if (!dieta) {
      console.warn('❌ No se encontró dieta con ID:', plato.dietaId);
      continue;
    }

    console.log('🔍 Dieta encontrada:', {
      dietaId: dieta._id,
      totalDias: dieta.dias.length
    });

    // Validar que los índices son válidos
    if (plato.diaIndex < 0 || plato.diaIndex >= dieta.dias.length) {
      console.warn('❌ Índice de día inválido:', plato.diaIndex);
      continue;
    }

    const dia = dieta.dias[plato.diaIndex];
    if (plato.comidaIndex < 0 || plato.comidaIndex >= dia.comidas.length) {
      console.warn('❌ Índice de comida inválido:', plato.comidaIndex);
      continue;
    }

    const comida = dia.comidas[plato.comidaIndex];
    if (plato.platoIndex < 0 || plato.platoIndex >= comida.platos.length) {
      console.warn('❌ Índice de plato inválido:', plato.platoIndex);
      continue;
    }

    // Acceder directamente al plato usando los índices
    const subPlato = comida.platos[plato.platoIndex];
    
    console.log('✅ Plato encontrado por índices:', {
      dietaId: plato.dietaId,
      diaIndex: plato.diaIndex,
      comidaIndex: plato.comidaIndex,
      platoIndex: plato.platoIndex,
      platoId: subPlato._id
    });

    // Actualizar propiedades del plato
    if (typeof plato.nombre !== 'undefined') subPlato.nombre = plato.nombre;
    if (typeof plato.orden !== 'undefined') subPlato.orden = plato.orden;
    
    // Actualizar receta
    const recetaAnterior = subPlato.receta?.toString();
    const recetaNueva = plato.receta;
    
    if (typeof plato.receta !== 'undefined' && plato.receta && plato.receta !== '') {
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
      subPlato.receta = undefined;
    }
    
    // Detectar si se cambió de receta a ingredientes personalizados o se quitó la receta
    const cambioRecetaAIngredientes = recetaAnterior && !recetaNueva && 
      typeof plato.ingredientesPersonalizados !== 'undefined';
    
    // Detectar si se añadieron ingredientes personalizados nuevos (no solo limpiar)
    const ingredientesPersonalizadosNuevos = cambioRecetaAIngredientes && 
      plato.ingredientesPersonalizados && 
      plato.ingredientesPersonalizados.length > 0;
    
    console.log('🔍 Detección de cambio de receta a ingredientes:', {
      recetaAnterior,
      recetaNueva,
      tieneIngredientesPersonalizados: !!(plato.ingredientesPersonalizados && plato.ingredientesPersonalizados.length > 0),
      cambioRecetaAIngredientes,
      ingredientesPersonalizadosNuevos
    });
    
    // Actualizar ingredientes personalizados
    if (typeof plato.ingredientesPersonalizados !== 'undefined') {
      console.log('🔄 Actualizando ingredientes personalizados:', {
        platoId: subPlato._id,
        ingredientesRecibidos: plato.ingredientesPersonalizados,
        ingredientesActuales: subPlato.ingredientesPersonalizados,
        cambioRecetaAIngredientes,
        ingredientesPersonalizadosNuevos
      });
      
      // Limpiar ingredientes existentes
      subPlato.ingredientesPersonalizados.splice(0, subPlato.ingredientesPersonalizados.length);
      
      // Si se detectó cambio de receta (quitada), limpiar completamente
      if (cambioRecetaAIngredientes) {
        console.log('🧹 Cambio detectado: limpiando ingredientes de receta anterior');
        if (ingredientesPersonalizadosNuevos) {
          console.log('✅ Añadiendo ingredientes personalizados nuevos');
        } else {
          console.log('🧹 Solo limpiando, no hay ingredientes personalizados nuevos');
        }
      }
      
      // Añadir los nuevos ingredientes
      for (const ing of plato.ingredientesPersonalizados) {
        if (ing.ingrediente) {
          // Verificar si es un ID de MongoDB válido (ingrediente local)
          if (mongoose.Types.ObjectId.isValid(ing.ingrediente)) {
            const nuevoIngrediente = {
              ingrediente: new mongoose.Types.ObjectId(ing.ingrediente),
              peso: ing.peso
            };
            subPlato.ingredientesPersonalizados.push(nuevoIngrediente);
            console.log('✅ Ingrediente local añadido:', nuevoIngrediente);
          } else if (ing.ingrediente === null || ing.ingrediente === '') {
            // Ingrediente de OpenFoodFacts (sin ID de MongoDB)
            const nuevoIngrediente = {
              ingrediente: null, // Para ingredientes de OpenFoodFacts
              peso: ing.peso
            };
            subPlato.ingredientesPersonalizados.push(nuevoIngrediente);
            console.log('✅ Ingrediente de OpenFoodFacts añadido:', nuevoIngrediente);
          } else {
            console.warn(`❌ Ingrediente con formato inválido omitido: ${ing.ingrediente}`);
          }
        } else {
          console.warn(`❌ Ingrediente sin ID omitido`);
        }
      }
      
      console.log('📊 Ingredientes finales después de actualizar:', subPlato.ingredientesPersonalizados);
    }
    
    console.log('💾 Guardando dieta con plato actualizado:', {
      platoId: subPlato._id,
      diaIndex: plato.diaIndex,
      comidaIndex: plato.comidaIndex,
      platoIndex: plato.platoIndex,
      ingredientesAntesDeGuardar: subPlato.ingredientesPersonalizados
    });
    
    // Verificar el estado antes de guardar
    const platoAntesDeGuardar = dieta.dias[plato.diaIndex].comidas[plato.comidaIndex].platos[plato.platoIndex];
    console.log('🔍 Estado del plato antes de guardar:', {
      ingredientesPersonalizados: platoAntesDeGuardar?.ingredientesPersonalizados
    });
    
    await dieta.save();
    
    // Verificar el estado después de guardar
    const dietaActualizada = await Dieta.findById(dieta._id);
    const platoDespuesDeGuardar = dietaActualizada?.dias[plato.diaIndex].comidas[plato.comidaIndex].platos[plato.platoIndex];
    console.log('🔍 Estado del plato después de guardar:', {
      ingredientesPersonalizados: platoDespuesDeGuardar?.ingredientesPersonalizados
    });
    
    console.log('✅ Dieta guardada exitosamente');
    actualizados.push(subPlato);
    diasActualizados.add(plato.diaIndex);
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