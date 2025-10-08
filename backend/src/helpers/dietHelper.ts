import mongoose from 'mongoose';
import Dieta from '../models/diets/dieta';

export interface IComida {
  horaEstimada?: string | null;
  nombreComida?: string | null;
  platos: IPlato[];
}

export interface IPlato {
  orden: number;
  nombre?: string;
  receta?: mongoose.Types.ObjectId;
  ingredientesPersonalizados?: Array<{
    ingrediente: mongoose.Types.ObjectId;
    peso: number;
  }>;
  
  // === CAMPOS DE SEGUIMIENTO ===
  satisfaccion?: number | null; // 1-5
  cumplimiento?: number | null; // 1-5
  notaUsuario?: string | null;
}

export async function buscarDietaYVerificarPermisos(
  dietaId: string, 
  userId: string, 
  verificarCreador = true
) {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inválido');
  }

  const dieta = await Dieta.findById(dietaId)
    .populate('creador', 'fullName email')
    .populate({
      path: 'dias.comidas.platos.receta',
      populate: {
        path: 'ingredientes.ingrediente',
        model: 'Ingrediente'
      }
    })
    .populate('dias.comidas.platos.ingredientesPersonalizados.ingrediente');

  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  // Verificar permisos para dietas normales
  if (verificarCreador) {
    // Si es una dieta pública, permitir acceso sin restricciones de permisos
    if (dieta.publica) {
      return dieta;
    }
    
    // Para dietas no públicas, verificar que sea el creador
    const esCreador = dieta.creador && 
      (dieta.creador._id?.toString() === userId || dieta.creador.toString() === userId);
    
    if (!esCreador) {
      throw new Error('No tienes permisos para actualizar esta dieta');
    }
    return dieta;
  }
  
  // Si es una dieta pública, permitir acceso sin restricciones de permisos
  if (dieta.publica) {
    return dieta;
  }

  const esCreador = dieta.creador && 
    (dieta.creador._id?.toString() === userId || dieta.creador.toString() === userId);
  
  let esAsignado = false;
  if (dieta.asignadaA && Array.isArray(dieta.asignadaA)) {
    esAsignado = dieta.asignadaA.some(user => {
      const userId2Compare = user._id ? user._id.toString() : user.toString();
      return userId2Compare === userId;
    });
  }

  if (!esCreador && !esAsignado) {
    throw new Error('No tienes permisos para ver esta dieta');
  }

  return dieta;
}

export function actualizarCamposBasicosDieta(
  dieta: typeof Dieta.prototype,
  datosActualizacion: {
    nombre?: string;
    descripcion?: string;
    tipo?: string[];
    draftMode?: boolean;
  }
) {
  if (datosActualizacion.nombre) dieta.nombre = datosActualizacion.nombre;
  if (datosActualizacion.descripcion) dieta.descripcion = datosActualizacion.descripcion;
  if (datosActualizacion.tipo && Array.isArray(datosActualizacion.tipo)) {
    dieta.tipo = datosActualizacion.tipo;
  }
  if (typeof datosActualizacion.draftMode === 'boolean') {
    dieta.draftMode = datosActualizacion.draftMode;
  }
}

export function actualizarDatosDiaDieta(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diaDieta: any,
  datosDia: {
    caloriasTotales?: number;
    proteinas?: number;
    hidratosCarbono?: number;
    grasas?: number;
    numeroComidas?: number;
    cumplimiento?: boolean;
    comidas?: Partial<IComida>[];
  }
) {
  if (typeof datosDia.caloriasTotales === 'number') 
    diaDieta.caloriasTotales = datosDia.caloriasTotales;
    
  if (typeof datosDia.proteinas === 'number')
    diaDieta.proteinas = datosDia.proteinas;
    
  if (typeof datosDia.hidratosCarbono === 'number')
    diaDieta.hidratosCarbono = datosDia.hidratosCarbono;
    
  if (typeof datosDia.grasas === 'number')
    diaDieta.grasas = datosDia.grasas;
    
  if (typeof datosDia.numeroComidas === 'number')
    diaDieta.numeroComidas = datosDia.numeroComidas;
    
  if (typeof datosDia.cumplimiento === 'boolean')
    diaDieta.cumplimiento = datosDia.cumplimiento;
  
  if (datosDia.comidas && Array.isArray(datosDia.comidas)) {
    for (let comidaIndex = 0; comidaIndex < datosDia.comidas.length; comidaIndex++) {
      if (comidaIndex < diaDieta.comidas.length) {
        const comida = diaDieta.comidas[comidaIndex];
        const comidaActualizada = datosDia.comidas[comidaIndex];
        
        if (typeof comidaActualizada.horaEstimada === 'string') {
          comida.horaEstimada = comidaActualizada.horaEstimada;
        }
        
        if (typeof comidaActualizada.nombreComida === 'string') {
          comida.nombreComida = comidaActualizada.nombreComida;
        }
      }
    }
  }
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
      if (porcentajes.proteinas <= 25) {
        errores.push(
          `Las proteínas representan el ${porcentajes.proteinas.toFixed(1)}% de las calorías. Para una dieta alta en proteínas debe ser mayor al 25%.`
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