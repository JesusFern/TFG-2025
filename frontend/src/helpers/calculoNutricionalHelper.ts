import { DiaDieta, Plato, Ingrediente } from '../types';

// Tipo para ingredientes con estructura backend directa
interface IngredienteBackend {
  _id?: string;
  id?: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  hidratosCarbono: number;
  grasas: number;
}

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
      // Intentar múltiples formas de extraer el ID
      const ingredienteObj = item.ingrediente as { _id?: string; id?: string; toString?: () => string };
      ingredienteId = ingredienteObj._id || ingredienteObj.id || ingredienteObj.toString?.() || '';
    } else {
      console.warn('Formato de ingrediente inválido:', item.ingrediente);
      continue;
    }
    
    // Buscar el ingrediente por ID
    const ingrediente = ingredientes.find(ing => 
      ing.id === ingredienteId || 
      (ing as unknown as IngredienteBackend)._id === ingredienteId ||
      ing.id === ingredienteId.toString()
    );
    
    if (debugNutricion) {
      console.log('🔍 Calculando nutrición del plato:', {
        platoNombre: plato.nombre,
        ingredienteId: ingredienteId,
        ingredienteTipo: typeof item.ingrediente,
        peso: item.peso,
        ingredienteEncontrado: !!ingrediente,
        ingredienteNombre: ingrediente?.nombre,
        totalIngredientesDisponibles: ingredientes.length
      });
    }
    
    if (ingrediente) {
      const peso = item.peso;
      const factor = peso / 100; // Los valores nutricionales están por 100g
      
      // ✅ MANEJAR DIFERENTES ESTRUCTURAS DE DATOS DE INGREDIENTES
      let calorias, proteinas, carbohidratos, grasas;
      
      if (ingrediente.informacionNutricional) {
        // Estructura frontend estándar
        calorias = ingrediente.informacionNutricional.calorias || 0;
        proteinas = ingrediente.informacionNutricional.proteinas || 0;
        carbohidratos = ingrediente.informacionNutricional.carbohidratos || 0;
        grasas = ingrediente.informacionNutricional.grasas || 0;
      } else if ((ingrediente as unknown as IngredienteBackend).calorias !== undefined) {
        // Estructura backend directa
        const ingredienteBackend = ingrediente as unknown as IngredienteBackend;
        calorias = ingredienteBackend.calorias || 0;
        proteinas = ingredienteBackend.proteinas || 0;
        carbohidratos = ingredienteBackend.hidratosCarbono || 0;
        grasas = ingredienteBackend.grasas || 0;
      } else {
        console.warn('❌ Estructura de ingrediente no reconocida:', {
          ingredienteNombre: ingrediente.nombre,
          ingrediente: ingrediente,
          tieneInformacionNutricional: !!ingrediente.informacionNutricional,
          propiedades: Object.keys(ingrediente)
        });
        continue;
      }
      
      totalCalorias += calorias * factor;
      totalProteinas += proteinas * factor;
      totalHidratosCarbono += carbohidratos * factor;
      totalGrasas += grasas * factor;
      
      if (debugNutricion) {
        console.log('✅ Valores nutricionales calculados:', {
          ingredienteNombre: ingrediente.nombre,
          calorias: calorias * factor,
          proteinas: proteinas * factor,
          hidratosCarbono: carbohidratos * factor,
          grasas: grasas * factor,
          estructura: ingrediente.informacionNutricional ? 'frontend' : 'backend'
        });
      }
    } else {
      console.warn('❌ Ingrediente no encontrado:', {
        ingredienteId: ingredienteId,
        ingredienteOriginal: item.ingrediente,
        ingredienteTipo: typeof item.ingrediente,
        ingredientesDisponibles: ingredientes.map(ing => ({ 
          id: ing.id, 
          _id: (ing as unknown as IngredienteBackend)._id,
          nombre: ing.nombre 
        }))
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
  // Debug desactivado para mejor rendimiento
  const debugNutricion = false; // Cambiar a true solo para debugging
  if (debugNutricion) {
    console.log('🧮 Actualizando nutrición del día:', {
      totalIngredientesDisponibles: ingredientes.length,
      totalComidas: dia.comidas?.length || 0,
      ingredientesDisponibles: ingredientes.map(ing => ({ id: ing.id, nombre: ing.nombre }))
    });
  }
  
  const nutricion = calcularNutricionDia(dia, ingredientes, debugNutricion);
  
  if (debugNutricion) {
    console.log('📊 Nutrición calculada para el día:', nutricion);
  }
  
  return {
    ...dia,
    caloriasTotales: nutricion.caloriasTotales,
    proteinas: nutricion.proteinas,
    hidratosCarbono: nutricion.hidratosCarbono,
    grasas: nutricion.grasas
  };
}

// ===== VALIDACIÓN DE TIPOS DE DIETA =====

/**
 * Calcula los porcentajes de macronutrientes basándose en las calorías
 * Proteína: 4 kcal/g, Carbohidratos: 4 kcal/g, Grasas: 9 kcal/g
 */
export function calcularPorcentajesMacronutrientes(
  proteinas: number,
  hidratosCarbono: number,
  grasas: number
): { proteinas: number; hidratosCarbono: number; grasas: number } {
  // Calcular calorías de cada macronutriente
  const caloriasProteinas = proteinas * 4;
  const caloriasCarbohidratos = hidratosCarbono * 4;
  const caloriasGrasas = grasas * 9;
  
  const totalCalorias = caloriasProteinas + caloriasCarbohidratos + caloriasGrasas;
  
  if (totalCalorias === 0) {
    return { proteinas: 0, hidratosCarbono: 0, grasas: 0 };
  }
  
  return {
    proteinas: (caloriasProteinas / totalCalorias) * 100,
    hidratosCarbono: (caloriasCarbohidratos / totalCalorias) * 100,
    grasas: (caloriasGrasas / totalCalorias) * 100
  };
}

/**
 * Valida si una dieta cumple con los requisitos de su tipo
 */
export function validarTipoDieta(
  tipoDieta: string,
  proteinas: number,
  hidratosCarbono: number,
  grasas: number
): { esValida: boolean; errores: string[] } {
  const porcentajes = calcularPorcentajesMacronutrientes(proteinas, hidratosCarbono, grasas);
  const errores: string[] = [];
  
  switch (tipoDieta) {
    case 'Baja en carbohidratos':
      if (porcentajes.hidratosCarbono >= 40) {
        errores.push(
          `Los carbohidratos representan el ${porcentajes.hidratosCarbono.toFixed(1)}% de las calorías. Para una dieta baja en carbohidratos debe ser menor al 40%.`
        );
      }
      break;
      
    case 'Keto':
      if (porcentajes.grasas < 70) {
        errores.push(
          `Las grasas representan el ${porcentajes.grasas.toFixed(1)}% de las calorías. Para una dieta keto debe ser al menos 70%.`
        );
      }
      break;
      
    case 'Alta en proteínas':
      if (porcentajes.proteinas <= 20) {
        errores.push(
          `Las proteínas representan el ${porcentajes.proteinas.toFixed(1)}% de las calorías. Para una dieta alta en proteínas debe ser mayor al 20%.`
        );
      }
      break;
  }
  
  return {
    esValida: errores.length === 0,
    errores
  };
}

/**
 * Valida todos los tipos de dieta de una dieta
 */
export function validarDietaCompleta(
  tiposDieta: string[],
  proteinas: number,
  hidratosCarbono: number,
  grasas: number
): { esValida: boolean; errores: string[] } {
  const errores: string[] = [];
  
  for (const tipo of tiposDieta) {
    const validacion = validarTipoDieta(tipo, proteinas, hidratosCarbono, grasas);
    errores.push(...validacion.errores);
  }
  
  return {
    esValida: errores.length === 0,
    errores: [...new Set(errores)] // Eliminar duplicados
  };
}