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
  if (dieta.asignadaA && dieta.asignadaA.length > 0) {
    // Enviar notificación a cada cliente asignado
    for (const clienteId of dieta.asignadaA) {
      try {
        await notificacionIntegracionService.notificarDietaPublicada(
          clienteId.toString(),
          userId,
          dietaId,
          dieta.nombre
        );
      } catch {
        // No lanzar error para no interrumpir el proceso de publicación
      }
    }

    // Crear recordatorios de comidas para todos los clientes
    try {
      if (dieta.duracion && dieta.dias && dieta.dias.length > 0) {
        for (let diaIndex = 0; diaIndex < (dieta.duracion || 0); diaIndex++) {
          const fechaDia = new Date(dieta.fechaInicio);
          fechaDia.setDate(dieta.fechaInicio.getDate() + diaIndex);
          
          // Obtener las comidas del primer día para usar como plantilla
          const primerDia = dieta.dias[0];
          if (primerDia && primerDia.comidas) {
            for (let comidaIndex = 0; comidaIndex < primerDia.comidas.length; comidaIndex++) {
              const comida = primerDia.comidas[comidaIndex];
              const horaComida = comida.horaEstimada;
              const nombreComida = comida.nombreComida;
              
              if (horaComida && nombreComida) {
                // Crear fecha y hora para la comida
                const [horas, minutos] = horaComida.split(':').map(Number);
                const fechaHoraComida = new Date(fechaDia);
                fechaHoraComida.setHours(horas, minutos, 0, 0);
                
                // Crear recordatorio para cada cliente
                for (const clienteId of dieta.asignadaA) {
                  try {
                    await recordatorioService.crearRecordatorioComida(
                      clienteId.toString(),
                      userId,
                      dieta._id.toString(),
                      nombreComida,
                      fechaHoraComida,
                      diaIndex
                    );
                  } catch {
                    // Continuar con los demás clientes aunque uno falle
                  }
                }
              }
            }
          }
        }
        
        // Recordatorios de comidas creados exitosamente
      }
    } catch {
      // No lanzar error para no interrumpir el proceso de publicación
    }
  }
  
  return {
    dieta,
    platosEliminados
  };
}

