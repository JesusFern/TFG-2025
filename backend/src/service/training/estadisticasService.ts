/* eslint-disable @typescript-eslint/no-explicit-any */
import RegistroEjercicio from '../../models/training/registroEjercicio';
import SesionPlan from '../../models/training/sesion';
import logger from '../../utils/logger';

// Interfaces para las estadísticas
export interface EstadisticasCliente {
  clienteId: string;
  periodo: {
    inicio: Date;
    fin: Date;
  };
  asistencia: {
    sesionesProgramadas: number;
    sesionesCompletadas: number;
    porcentajeAsistencia: number;
    sesionesAtrasadas: number;
  };
  progresoEjercicios: {
    ejercicioId: string;
    ejercicioNombre: string;
    progreso: {
      cargaMaxima: number;
      repeticionesMaximas: number;
      sesionesRealizadas: number;
      tendencia: 'mejora' | 'estable' | 'baja';
    };
  }[];
  consistencia: {
    diasEntrenamiento: number;
    diasSemana: number;
    porcentajeConsistencia: number;
  };
  rendimiento: {
    tiempoPromedioSesion: number;
    ejerciciosCompletados: number;
    ejerciciosTotal: number;
    porcentajeCompletitud: number;
  };
}

export interface EstadisticasSemanal {
  semana: {
    numero: number;
    inicio: Date;
    fin: Date;
  };
  asistencia: {
    sesionesProgramadas: number;
    sesionesCompletadas: number;
    porcentajeAsistencia: number;
  };
  progreso: {
    ejerciciosRegistrados: number;
    ejerciciosCompletados: number;
    cargaTotalUtilizada: number;
    tiempoTotalEntrenamiento: number;
  };
  tendencias: {
    mejoraEjercicios: string[];
    ejerciciosEstables: string[];
    ejerciciosBajos: string[];
  };
}

export interface ProgresoEjercicio {
  ejercicioId: string;
  ejercicioNombre: string;
  historial: {
    fecha: Date;
    cargaUtilizada: number;
    repeticionesRealizadas: number;
    seriesCompletadas: number;
    completado: boolean;
  }[];
  estadisticas: {
    cargaMaxima: number;
    repeticionesMaximas: number;
    promedioSeries: number;
    sesionesRealizadas: number;
    ultimaSesion: Date | null;
  };
}

// Servicio principal de estadísticas
export async function obtenerEstadisticasClienteService(
  clienteId: string,
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<EstadisticasCliente> {
  try {
    logger.info('Obteniendo estadísticas del cliente', { clienteId, fechaInicio, fechaFin });

    // Establecer fechas por defecto (último mes)
    const fin = fechaFin || new Date();
    const inicio = fechaInicio || new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Obtener sesiones del cliente en el período
    const sesiones = await SesionPlan.find({
      cliente: clienteId,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('ejercicios.ejercicio');

    // Obtener registros de ejercicios del cliente en el período
    const registros = await RegistroEjercicio.find({
      cliente: clienteId,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('ejercicio');

    // Calcular estadísticas de asistencia
    const sesionesProgramadas = sesiones.length;
    const sesionesCompletadas = sesiones.filter((s: any) => s.completada).length;
    const porcentajeAsistencia = sesionesProgramadas > 0 ? (sesionesCompletadas / sesionesProgramadas) * 100 : 0;
    const sesionesAtrasadas = sesiones.filter((s: any) => {
      const fechaSesion = new Date(s.fecha);
      const hoy = new Date();
      return fechaSesion < hoy && !s.completada;
    }).length;

    // Calcular progreso de ejercicios
    const progresoEjercicios = await calcularProgresoEjercicios(registros);

    // Calcular consistencia
    const diasEntrenamiento = new Set(registros.map((r: any) => r.fecha.toDateString())).size;
    const diasSemana = Math.ceil((fin.getTime() - inicio.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 7;
    const porcentajeConsistencia = (diasEntrenamiento / diasSemana) * 100;

    // Calcular rendimiento
    const tiempoPromedioSesion = await calcularTiempoPromedioSesion(registros);
    const ejerciciosCompletados = registros.filter((r: any) => r.completado).length;
    const ejerciciosTotal = registros.length;
    const porcentajeCompletitud = ejerciciosTotal > 0 ? (ejerciciosCompletados / ejerciciosTotal) * 100 : 0;

    const estadisticas: EstadisticasCliente = {
      clienteId,
      periodo: { inicio, fin },
      asistencia: {
        sesionesProgramadas,
        sesionesCompletadas,
        porcentajeAsistencia,
        sesionesAtrasadas
      },
      progresoEjercicios,
      consistencia: {
        diasEntrenamiento,
        diasSemana,
        porcentajeConsistencia
      },
      rendimiento: {
        tiempoPromedioSesion,
        ejerciciosCompletados,
        ejerciciosTotal,
        porcentajeCompletitud
      }
    };

    logger.info('Estadísticas del cliente calculadas correctamente', { clienteId });
    return estadisticas;

  } catch (error) {
    logger.error('Error al obtener estadísticas del cliente', {
      error: error instanceof Error ? error.message : String(error),
      clienteId
    });
    throw new Error('Error al obtener estadísticas del cliente');
  }
}

export async function obtenerEstadisticasSemanalService(
  clienteId: string,
  numeroSemana: number,
  año: number
): Promise<EstadisticasSemanal> {
  try {
    logger.info('Obteniendo estadísticas semanales', { clienteId, numeroSemana, año });

    // Calcular fechas de la semana
    const inicioSemana = new Date(año, 0, 1);
    const diasHastaSemana = (numeroSemana - 1) * 7;
    const inicio = new Date(inicioSemana.getTime() + diasHastaSemana * 24 * 60 * 60 * 1000);
    const fin = new Date(inicio.getTime() + 6 * 24 * 60 * 60 * 1000);

    // Obtener sesiones de la semana
    const sesiones = await SesionPlan.find({
      cliente: clienteId,
      fecha: { $gte: inicio, $lte: fin }
    });

    // Obtener registros de la semana
    const registros = await RegistroEjercicio.find({
      cliente: clienteId,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('ejercicio');

    // Calcular estadísticas de asistencia
    const sesionesProgramadas = sesiones.length;
    const sesionesCompletadas = sesiones.filter((s: any) => s.completada).length;
    const porcentajeAsistencia = sesionesProgramadas > 0 ? (sesionesCompletadas / sesionesProgramadas) * 100 : 0;

    // Calcular progreso
    const ejerciciosRegistrados = registros.length;
    const ejerciciosCompletados = registros.filter((r: any) => r.completado).length;
    const cargaTotalUtilizada = registros.reduce((sum: number, r: any) => sum + (r.cargaUtilizada || 0), 0);
    const tiempoTotalEntrenamiento = registros.reduce((sum: number, r: any) => sum + (r.duracionEjercicio || 0), 0);

    // Calcular tendencias
    const tendencias = await calcularTendenciasEjercicios(registros);

    const estadisticas: EstadisticasSemanal = {
      semana: {
        numero: numeroSemana,
        inicio,
        fin
      },
      asistencia: {
        sesionesProgramadas,
        sesionesCompletadas,
        porcentajeAsistencia
      },
      progreso: {
        ejerciciosRegistrados,
        ejerciciosCompletados,
        cargaTotalUtilizada,
        tiempoTotalEntrenamiento
      },
      tendencias
    };

    logger.info('Estadísticas semanales calculadas correctamente', { clienteId, numeroSemana });
    return estadisticas;

  } catch (error) {
    logger.error('Error al obtener estadísticas semanales', {
      error: error instanceof Error ? error.message : String(error),
      clienteId, numeroSemana
    });
    throw new Error('Error al obtener estadísticas semanales');
  }
}

export async function obtenerProgresoEjerciciosService(
  clienteId: string,
  ejercicioId?: string
): Promise<ProgresoEjercicio[]> {
  try {
    logger.info('Obteniendo progreso de ejercicios', { clienteId, ejercicioId });

    const filtro: any = { cliente: clienteId };
    if (ejercicioId) {
      filtro.ejercicio = ejercicioId;
    }

    const registros = await RegistroEjercicio.find(filtro)
      .populate('ejercicio')
      .sort({ fecha: 1 });

    // Agrupar por ejercicio
    const ejerciciosMap = new Map<string, any[]>();
    registros.forEach((registro: any) => {
      const ejercicioId = typeof registro.ejercicio === 'string' 
        ? registro.ejercicio 
        : (registro.ejercicio as any)._id.toString();
      
      if (!ejerciciosMap.has(ejercicioId)) {
        ejerciciosMap.set(ejercicioId, []);
      }
      ejerciciosMap.get(ejercicioId)!.push(registro);
    });

    const progresoEjercicios: ProgresoEjercicio[] = [];

    ejerciciosMap.forEach((registrosEjercicio, ejercicioId) => {
      const ejercicio = registrosEjercicio[0].ejercicio;
      const ejercicioNombre = typeof ejercicio === 'string' ? 'Ejercicio' : (ejercicio as any).nombre;

      const historial = registrosEjercicio.map((r: any) => ({
        fecha: r.fecha,
        cargaUtilizada: r.cargaUtilizada || 0,
        repeticionesRealizadas: r.repeticionesRealizadas,
        seriesCompletadas: r.seriesCompletadas,
        completado: r.completado
      }));

      const estadisticas = {
        cargaMaxima: Math.max(...historial.map((h: any) => h.cargaUtilizada)),
        repeticionesMaximas: Math.max(...historial.map((h: any) => h.repeticionesRealizadas)),
        promedioSeries: historial.reduce((sum: number, h: any) => sum + h.seriesCompletadas, 0) / historial.length,
        sesionesRealizadas: historial.length,
        ultimaSesion: historial.length > 0 ? historial[historial.length - 1].fecha : null
      };

      progresoEjercicios.push({
        ejercicioId,
        ejercicioNombre,
        historial,
        estadisticas
      });
    });

    logger.info('Progreso de ejercicios obtenido correctamente', { clienteId, cantidad: progresoEjercicios.length });
    return progresoEjercicios;

  } catch (error) {
    logger.error('Error al obtener progreso de ejercicios', {
      error: error instanceof Error ? error.message : String(error),
      clienteId
    });
    throw new Error('Error al obtener progreso de ejercicios');
  }
}

// Funciones auxiliares
async function calcularProgresoEjercicios(registros: any[]): Promise<{
  ejercicioId: string;
  ejercicioNombre: string;
  progreso: {
    cargaMaxima: number;
    repeticionesMaximas: number;
    sesionesRealizadas: number;
    tendencia: 'mejora' | 'estable' | 'baja';
  };
}[]> {
  const ejerciciosMap = new Map<string, any[]>();
  
  registros.forEach((registro: any) => {
    const ejercicioId = typeof registro.ejercicio === 'string' 
      ? registro.ejercicio 
      : (registro.ejercicio as any)._id.toString();
    
    if (!ejerciciosMap.has(ejercicioId)) {
      ejerciciosMap.set(ejercicioId, []);
    }
    ejerciciosMap.get(ejercicioId)!.push(registro);
  });

  const progresoEjercicios: {
    ejercicioId: string;
    ejercicioNombre: string;
    progreso: {
      cargaMaxima: number;
      repeticionesMaximas: number;
      sesionesRealizadas: number;
      tendencia: 'mejora' | 'estable' | 'baja';
    };
  }[] = [];

  ejerciciosMap.forEach((registrosEjercicio, ejercicioId) => {
    const ejercicio = registrosEjercicio[0].ejercicio;
    const ejercicioNombre = typeof ejercicio === 'string' ? 'Ejercicio' : (ejercicio as any).nombre;

    const cargas = registrosEjercicio.map((r: any) => r.cargaUtilizada || 0);
    const repeticiones = registrosEjercicio.map((r: any) => r.repeticionesRealizadas);

    const cargaMaxima = Math.max(...cargas);
    const repeticionesMaximas = Math.max(...repeticiones);
    const sesionesRealizadas = registrosEjercicio.length;

    // Calcular tendencia (simplificado)
    const tendencia = calcularTendencia(cargas);

    progresoEjercicios.push({
      ejercicioId,
      ejercicioNombre,
      progreso: {
        cargaMaxima,
        repeticionesMaximas,
        sesionesRealizadas,
        tendencia
      }
    });
  });

  return progresoEjercicios;
}

async function calcularTiempoPromedioSesion(registros: any[]): Promise<number> {
  const sesionesMap = new Map<string, number>();
  
  registros.forEach((registro: any) => {
    const sesionId = registro.sesion.toString();
    const duracion = registro.duracionEjercicio || 0;
    
    if (!sesionesMap.has(sesionId)) {
      sesionesMap.set(sesionId, 0);
    }
    sesionesMap.set(sesionId, sesionesMap.get(sesionId)! + duracion);
  });

  const duraciones = Array.from(sesionesMap.values());
  return duraciones.length > 0 ? duraciones.reduce((sum, d) => sum + d, 0) / duraciones.length : 0;
}

async function calcularTendenciasEjercicios(registros: any[]): Promise<{
  mejoraEjercicios: string[];
  ejerciciosEstables: string[];
  ejerciciosBajos: string[];
}> {
  const ejerciciosMap = new Map<string, any[]>();
  
  registros.forEach((registro: any) => {
    const ejercicioId = typeof registro.ejercicio === 'string' 
      ? registro.ejercicio 
      : (registro.ejercicio as any)._id.toString();
    
    if (!ejerciciosMap.has(ejercicioId)) {
      ejerciciosMap.set(ejercicioId, []);
    }
    ejerciciosMap.get(ejercicioId)!.push(registro);
  });

  const mejoraEjercicios: string[] = [];
  const ejerciciosEstables: string[] = [];
  const ejerciciosBajos: string[] = [];

  ejerciciosMap.forEach((registrosEjercicio) => {
    const ejercicio = registrosEjercicio[0].ejercicio;
    const ejercicioNombre = typeof ejercicio === 'string' ? 'Ejercicio' : (ejercicio as any).nombre;
    
    const cargas = registrosEjercicio.map((r: any) => r.cargaUtilizada || 0);
    const tendencia = calcularTendencia(cargas);

    if (tendencia === 'mejora') {
      mejoraEjercicios.push(ejercicioNombre);
    } else if (tendencia === 'estable') {
      ejerciciosEstables.push(ejercicioNombre);
    } else {
      ejerciciosBajos.push(ejercicioNombre);
    }
  });

  return {
    mejoraEjercicios,
    ejerciciosEstables,
    ejerciciosBajos
  };
}

function calcularTendencia(valores: number[]): 'mejora' | 'estable' | 'baja' {
  if (valores.length < 2) return 'estable';
  
  const primeros = valores.slice(0, Math.ceil(valores.length / 2));
  const ultimos = valores.slice(-Math.ceil(valores.length / 2));
  
  const promedioPrimeros = primeros.reduce((sum, v) => sum + v, 0) / primeros.length;
  const promedioUltimos = ultimos.reduce((sum, v) => sum + v, 0) / ultimos.length;
  
  const diferencia = promedioUltimos - promedioPrimeros;
  const porcentajeCambio = (diferencia / promedioPrimeros) * 100;
  
  if (porcentajeCambio > 5) return 'mejora';
  if (porcentajeCambio < -5) return 'baja';
  return 'estable';
}