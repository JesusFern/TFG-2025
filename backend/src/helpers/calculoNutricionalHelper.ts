import Ingrediente from '../models/diets/ingrediente';
import mongoose from 'mongoose';

export interface CalculoNutricional {
  caloriasTotales: number;
  proteinas: number;
  hidratosCarbono: number;
  grasas: number;
}

interface IngredientePersonalizado {
  ingrediente: mongoose.Types.ObjectId;
  peso: number;
}

interface Plato {
  ingredientesPersonalizados: IngredientePersonalizado[];
}

interface Comida {
  platos: Plato[];
}

interface DiaDieta {
  comidas: Comida[];
  caloriasTotales?: number | null;
  proteinas?: number | null;
  hidratosCarbono?: number | null;
  grasas?: number | null;
}

interface Dieta {
  dias: DiaDieta[];
  save(): Promise<Dieta>;
}

/**
 * Calcula las calorías y macronutrientes de un plato basándose en sus ingredientes personalizados
 */
export async function calcularNutricionPlato(plato: Plato): Promise<CalculoNutricional> {
  if (!plato.ingredientesPersonalizados || plato.ingredientesPersonalizados.length === 0) {
    return {
      caloriasTotales: 0,
      proteinas: 0,
      hidratosCarbono: 0,
      grasas: 0
    };
  }

  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalHidratosCarbono = 0;
  let totalGrasas = 0;

  // Obtener los ingredientes de la base de datos
  const ingredientesIds = plato.ingredientesPersonalizados.map((item: IngredientePersonalizado) => item.ingrediente.toString());
  const ingredientes = await Ingrediente.find({ _id: { $in: ingredientesIds } });

  for (const item of plato.ingredientesPersonalizados) {
    const ingrediente = ingredientes.find(ing => ing._id.toString() === item.ingrediente.toString());
    
    if (ingrediente) {
      const peso = item.peso;
      const factor = peso / 100; // Los valores nutricionales están por 100g
      
      totalCalorias += ingrediente.calorias * factor;
      totalProteinas += ingrediente.proteinas * factor;
      totalHidratosCarbono += ingrediente.hidratosCarbono * factor;
      totalGrasas += ingrediente.grasas * factor;
    }
  }

  return {
    caloriasTotales: Math.round(totalCalorias * 100) / 100,
    proteinas: Math.round(totalProteinas * 100) / 100,
    hidratosCarbono: Math.round(totalHidratosCarbono * 100) / 100,
    grasas: Math.round(totalGrasas * 100) / 100
  };
}

/**
 * Calcula las calorías y macronutrientes de un día completo basándose en todos sus platos
 */
export async function calcularNutricionDia(dia: DiaDieta): Promise<CalculoNutricional> {
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalHidratosCarbono = 0;
  let totalGrasas = 0;

  if (!dia.comidas || !Array.isArray(dia.comidas)) {
    return {
      caloriasTotales: 0,
      proteinas: 0,
      hidratosCarbono: 0,
      grasas: 0
    };
  }

  // Iterar por todas las comidas del día
  for (const comida of dia.comidas) {
    if (comida.platos && Array.isArray(comida.platos)) {
      // Iterar por todos los platos de cada comida
      for (const plato of comida.platos) {
        const nutricionPlato = await calcularNutricionPlato(plato);
        
        totalCalorias += nutricionPlato.caloriasTotales;
        totalProteinas += nutricionPlato.proteinas;
        totalHidratosCarbono += nutricionPlato.hidratosCarbono;
        totalGrasas += nutricionPlato.grasas;
      }
    }
  }

  return {
    caloriasTotales: Math.round(totalCalorias * 100) / 100,
    proteinas: Math.round(totalProteinas * 100) / 100,
    hidratosCarbono: Math.round(totalHidratosCarbono * 100) / 100,
    grasas: Math.round(totalGrasas * 100) / 100
  };
}

/**
 * Actualiza las calorías y macronutrientes de un día específico en una dieta
 */
export async function actualizarNutricionDia(dieta: Dieta, diaIndex: number): Promise<void> {
  if (!dieta.dias || !dieta.dias[diaIndex]) {
    return;
  }

  const dia = dieta.dias[diaIndex];
  const nutricion = await calcularNutricionDia(dia);

  // Actualizar los valores nutricionales del día
  dia.caloriasTotales = nutricion.caloriasTotales;
  dia.proteinas = nutricion.proteinas;
  dia.hidratosCarbono = nutricion.hidratosCarbono;
  dia.grasas = nutricion.grasas;

  // Guardar la dieta actualizada
  await dieta.save();
}

