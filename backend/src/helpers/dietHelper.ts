import mongoose from 'mongoose';
import Dieta from '../models/diets/dieta';

export interface IComida {
  horaEstimada?: string | null;
  nombreComida?: string | null;
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
    .populate('asignadaA', 'fullName email');

  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  // Verificar permisos
  if (verificarCreador) {
    if (dieta.creador.toString() !== userId) {
      throw new Error('No tienes permisos para actualizar esta dieta');
    }
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
    macronutrientes?: string;
    micronutrientes?: string;
    numeroComidas?: number;
    requerimientosHidratacion?: string;
    cumplimiento?: boolean;
    comidas?: Partial<IComida>[];
  }
) {
  if (typeof datosDia.caloriasTotales === 'number') 
    diaDieta.caloriasTotales = datosDia.caloriasTotales;
    
  if (typeof datosDia.macronutrientes === 'string')
    diaDieta.macronutrientes = datosDia.macronutrientes;
    
  if (typeof datosDia.micronutrientes === 'string')
    diaDieta.micronutrientes = datosDia.micronutrientes;
    
  if (typeof datosDia.numeroComidas === 'number')
    diaDieta.numeroComidas = datosDia.numeroComidas;
    
  if (typeof datosDia.requerimientosHidratacion === 'string')
    diaDieta.requerimientosHidratacion = datosDia.requerimientosHidratacion;
    
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
