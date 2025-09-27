import { DiaDieta, Plato, Ingrediente } from '../types';

export interface CalculoNutricional {
  caloriasTotales: number;
  proteinas: number;
  hidratosCarbono: number;
  grasas: number;
}

/**
 * Calcula las calorías y macronutrientes de un plato basándose en sus ingredientes personalizados
 */
export function calcularNutricionPlato(plato: Plato, ingredientes: Ingrediente[], debugNutricion: boolean = false): CalculoNutricional {
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

  for (const item of plato.ingredientesPersonalizados) {
    // Extraer el ID del ingrediente, manejando tanto strings como objetos poblados
    let ingredienteId: string;
    if (typeof item.ingrediente === 'string') {
      ingredienteId = item.ingrediente;
    } else if (item.ingrediente && typeof item.ingrediente === 'object') {
      ingredienteId = (item.ingrediente as { _id?: string; id?: string })._id || (item.ingrediente as { _id?: string; id?: string }).id || '';
    } else {
      console.warn('Formato de ingrediente inválido:', item.ingrediente);
      continue;
    }
    
    const ingrediente = ingredientes.find(ing => ing.id === ingredienteId);
    
    if (debugNutricion) {
      console.log('Calculando nutrición del plato:', {
        platoNombre: plato.nombre,
        ingredienteId: ingredienteId,
        peso: item.peso,
        ingredienteEncontrado: !!ingrediente,
        ingredienteNombre: ingrediente?.nombre
      });
    }
    
    if (ingrediente) {
      const peso = item.peso;
      const factor = peso / 100; // Los valores nutricionales están por 100g
      
      totalCalorias += ingrediente.informacionNutricional.calorias * factor;
      totalProteinas += ingrediente.informacionNutricional.proteinas * factor;
      totalHidratosCarbono += ingrediente.informacionNutricional.carbohidratos * factor;
      totalGrasas += ingrediente.informacionNutricional.grasas * factor;
      
      if (debugNutricion) {
        console.log('Valores nutricionales calculados:', {
          calorias: ingrediente.informacionNutricional.calorias * factor,
          proteinas: ingrediente.informacionNutricional.proteinas * factor,
          hidratosCarbono: ingrediente.informacionNutricional.carbohidratos * factor,
          grasas: ingrediente.informacionNutricional.grasas * factor
        });
      }
    } else {
      console.warn('Ingrediente no encontrado:', {
        ingredienteId: ingredienteId,
        ingredientesDisponibles: ingredientes.map(ing => ({ id: ing.id, nombre: ing.nombre }))
      });
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
export function calcularNutricionDia(dia: DiaDieta, ingredientes: Ingrediente[], debugNutricion: boolean = false): CalculoNutricional {
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
        const nutricionPlato = calcularNutricionPlato(plato, ingredientes, debugNutricion);
        
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
 * Actualiza los valores nutricionales de un día de dieta
 */
export function actualizarNutricionDia(dia: DiaDieta, ingredientes: Ingrediente[]): DiaDieta {
  // Solo mostrar log si se pide explícitamente (para debugging)
  const debugNutricion = false; // Cambiar a true solo para debugging
  if (debugNutricion) {
    console.log('Actualizando nutrición del día:', {
      totalIngredientesDisponibles: ingredientes.length,
      totalComidas: dia.comidas?.length || 0
    });
  }
  
  const nutricion = calcularNutricionDia(dia, ingredientes, debugNutricion);
  
  if (debugNutricion) {
    console.log('Nutrición calculada para el día:', nutricion);
  }
  
  return {
    ...dia,
    caloriasTotales: nutricion.caloriasTotales,
    proteinas: nutricion.proteinas,
    hidratosCarbono: nutricion.hidratosCarbono,
    grasas: nutricion.grasas
  };
}