import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';
import mongoose from 'mongoose';
import { 
  buscarDietaYVerificarPermisos,
  actualizarCamposBasicosDieta,
  actualizarDatosDiaDieta
} from '../../helpers/dietHelper';
import { notificacionIntegracionService } from '../notificaciones/notificacionIntegracionService';
import { recordatorioService } from '../notificaciones/recordatorioService';
import logger from '../../utils/logger';

interface PlatoDocument {
  orden: number;
  nombre?: string;
  receta?: mongoose.Types.ObjectId;
}

export async function crearDietaService({
  creadorId,
  nombre,
  descripcion,
  tipo,
  duracion,
  comidasDiarias,
  asignadaA,
  fechaInicio,
  horasComidas,
  nombreComidas,
  draftMode = true
}: {
  creadorId: string;
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  asignadaA: string;
  fechaInicio: string;
  horasComidas: string[];
  nombreComidas: string[];
  draftMode?: boolean;
}) {
  const usuarioAsignado = await User.findById(asignadaA);
  if (!usuarioAsignado || usuarioAsignado.role !== 'user') {
    throw new Error('El usuario asignado debe tener rol user');
  }

  if (!duracion || !Number.isInteger(duracion) || duracion < 1) {
    throw new Error('La duración debe ser un número entero mayor que 0');
  }

  if (
    !comidasDiarias ||
    !Number.isInteger(comidasDiarias) ||
    comidasDiarias <= 1 ||
    comidasDiarias >= 10
  ) {
    throw new Error('El número de comidas diarias debe ser un número entero mayor que 1 y menor que 10');
  }

  if (!fechaInicio) {
    throw new Error('La fecha de inicio es obligatoria');
  }
  
  if (!horasComidas || !Array.isArray(horasComidas) || horasComidas.length !== comidasDiarias) {
    throw new Error(`El array horasComidas debe tener exactamente ${comidasDiarias} elementos`);
  }

  if (!nombreComidas || !Array.isArray(nombreComidas) || nombreComidas.length !== comidasDiarias) {
    throw new Error(`El array nombreComidas debe tener exactamente ${comidasDiarias} elementos`);
  }

  const [day, month, year] = fechaInicio.split('-').map(Number);
  const fechaInicioDate = new Date(year, month - 1, day);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaInicioDate <= hoy) {
    throw new Error('La fecha de inicio debe ser posterior al día actual');
  }

  const dias = Array.from({ length: duracion }, () => ({
    caloriasTotales: null,
    proteinas: null,
    hidratosCarbono: null,
    grasas: null,
    numeroComidas: comidasDiarias,
    cumplimiento: false,
    comidas: Array.from({ length: comidasDiarias }, (_, comidaIndex) => ({
        horaEstimada: horasComidas[comidaIndex],
        nombreComida: nombreComidas[comidaIndex],
        platos: Array.from({ length: 3 }, (_, i) => ({
            orden: i,
            nombre: null,
            receta: null
        }))
    }))
  }));

  const dieta = new Dieta({
    nombre,
    descripcion,
    tipo,
    duracion,
    comidasDiarias,
    dias,
    fechaInicio: fechaInicioDate,
    creador: creadorId,
    asignadaA: [asignadaA],
    draftMode
  });

  await dieta.save();

  // Crear recordatorios automáticos para las comidas de cada día
  try {
    for (let diaIndex = 0; diaIndex < duracion; diaIndex++) {
      const fechaDia = new Date(fechaInicioDate);
      fechaDia.setDate(fechaInicioDate.getDate() + diaIndex);
      
      for (let comidaIndex = 0; comidaIndex < comidasDiarias; comidaIndex++) {
        const horaComida = horasComidas[comidaIndex];
        const nombreComida = nombreComidas[comidaIndex];
        
        // Crear fecha y hora para la comida
        const [horas, minutos] = horaComida.split(':').map(Number);
        const fechaHoraComida = new Date(fechaDia);
        fechaHoraComida.setHours(horas, minutos, 0, 0);
        
        // Crear recordatorio 30 minutos antes de la comida
        await recordatorioService.crearRecordatorioComida(
          asignadaA,
          creadorId,
          dieta._id.toString(),
          nombreComida,
          fechaHoraComida,
          diaIndex + 1
        );
      }
    }
    
    logger.info(`Recordatorios de comidas creados para dieta ${dieta._id} (${duracion} días, ${comidasDiarias} comidas/día)`);
  } catch (error) {
    logger.error('Error al crear recordatorios de comidas:', error);
    // No lanzar error para no interrumpir la creación de la dieta
  }

  return dieta;
}

export async function obtenerDietaService(dietaId: string, userId: string) {
  return await buscarDietaYVerificarPermisos(dietaId, userId, false);
}
export async function actualizarDietaService(
  dietaId: string, 
  userId: string, 
  datosActualizacion: {
    nombre?: string;
    descripcion?: string;
    tipo?: string[];
    duracion?: number;
    comidasDiarias?: number;
    fechaInicio?: string;
    dias?: Array<{
      _dayIndex?: number;
      caloriasTotales?: number;
      proteinas?: number;
      hidratosCarbono?: number;
      grasas?: number;
      numeroComidas?: number;
      cumplimiento?: boolean;
      comidas?: Array<{
        horaEstimada?: string;
        nombreComida?: string;
      }>;
    }>;
    draftMode?: boolean;
  }
) {
  const dieta = await buscarDietaYVerificarPermisos(dietaId, userId, true);

  if (datosActualizacion.dias && Array.isArray(datosActualizacion.dias)) {
    for (const diaActualizado of datosActualizacion.dias) {
      if (typeof diaActualizado._dayIndex === 'number') {
        const index = diaActualizado._dayIndex;
        
        if (index >= 0 && index < dieta.dias.length) {
          const diaExistente = dieta.dias[index];
          
          actualizarDatosDiaDieta(diaExistente, diaActualizado);
        }
      }
    }
  }

  actualizarCamposBasicosDieta(dieta, datosActualizacion);

  await dieta.save();
  return dieta;
}

export async function actualizarDiaDietaService(
  dietaId: string,
  userId: string,
  diaIndex: number,
  datosDia: {
    caloriasTotales?: number;
    proteinas?: number;
    hidratosCarbono?: number;
    grasas?: number;
    numeroComidas?: number;
    cumplimiento?: boolean;
    comidas?: Array<{
      horaEstimada?: string;
      nombreComida?: string;
    }>;
  }
) {
  const dieta = await buscarDietaYVerificarPermisos(dietaId, userId, true);

  if (diaIndex < 0 || diaIndex >= dieta.dias.length) {
    throw new Error('Índice de día inválido');
  }

  const diaExistente = dieta.dias[diaIndex];
  
  actualizarDatosDiaDieta(diaExistente, datosDia);

  await dieta.save();
  
  return diaExistente;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function limpiarPlatosVaciosService(dieta: any): Promise<number> {
  let platosEliminados = 0;
  
  for (let diaIndex = 0; diaIndex < dieta.dias.length; diaIndex++) {
    const dia = dieta.dias[diaIndex];
    
    for (let comidaIndex = 0; comidaIndex < dia.comidas.length; comidaIndex++) {
      const comida = dia.comidas[comidaIndex];
      
      const platosOriginales = comida.platos.length;
      comida.platos = comida.platos.filter((plato: PlatoDocument) => {
        const tieneNombre = plato.nombre && plato.nombre.trim() !== '';
        const tieneReceta = plato.receta && plato.receta.toString() !== '';
        return tieneNombre || tieneReceta;
      });
      
      comida.platos.forEach((plato: PlatoDocument, index: number) => {
        plato.orden = index + 1;
      });
      
      const platosEliminadosEnComida = platosOriginales - comida.platos.length;
      platosEliminados += platosEliminadosEnComida;
    }
  }
  
  return platosEliminados;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publicarDietaService(dietaId: string, userId: string): Promise<{ dieta: any; platosEliminados: number }> {
  const dieta = await buscarDietaYVerificarPermisos(dietaId, userId, true);
  
  const platosEliminados = await limpiarPlatosVaciosService(dieta);
  
  dieta.draftMode = false;
  await dieta.save();
  
  // Enviar notificaciones a todos los clientes asignados
  console.log('Dieta publicada - Clientes asignados:', dieta.asignadaA?.length || 0);
  if (dieta.asignadaA && dieta.asignadaA.length > 0) {
    // Extraer solo los IDs de los clientes
    const clienteIds = dieta.asignadaA.map(cliente => 
      typeof cliente === 'string' ? cliente : cliente._id?.toString() || cliente.toString()
    );
    console.log('Enviando notificaciones a clientes:', clienteIds);
    
    // Enviar notificación a cada cliente asignado
    for (const clienteId of clienteIds) {
      try {
        console.log(`Enviando notificación de dieta "${dieta.nombre}" a cliente ${clienteId}`);
        await notificacionIntegracionService.notificarDietaPublicada(
          clienteId,
          userId,
          dietaId,
          dieta.nombre
        );
        console.log(`Notificación enviada exitosamente a cliente ${clienteId}`);

      } catch (error) {
        console.error(`Error al enviar notificación de dieta publicada a cliente ${clienteId}:`, error);
        // No lanzar error para no interrumpir el proceso de publicación
      }
    }
  } else {
    console.log('No hay clientes asignados a esta dieta, no se enviarán notificaciones');
  }
  
  return {
    dieta,
    platosEliminados
  };
}

