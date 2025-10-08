/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import RegistroEjercicio from '../../models/training/registroEjercicio';
import Sesion from '../../models/training/sesion';
import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import User from '../../models/users/user';
import logger from '../../utils/logger';

// Funciones de validación y sanitización para prevenir inyección NoSQL
function validateAndSanitizeObjectId(id: string, fieldName: string): mongoose.Types.ObjectId {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`${fieldName} no puede estar vacío`);
  }
  
  const trimmedId = id.trim();
  
  if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
    throw new Error(`${fieldName} no es un ObjectId válido`);
  }
  
  return new mongoose.Types.ObjectId(trimmedId);
}


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
    grupoMuscular: string;
    registros: {
      fecha: string;
      cargaUtilizada: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      completado: boolean;
    }[];
    progreso: {
      mejoraCarga: number;
      mejoraRepeticiones: number;
      mejoraSeries: number;
      tendencia: 'mejora' | 'estable' | 'baja';
    };
    estadisticas: {
      cargaMaxima: number;
      repeticionesMaximas: number;
      seriesMaximas: number;
      promedioSesiones: number;
      totalSesiones: number;
    };
  }[];
  consistencia: {
    diasEntrenados: number;
    diasDisponibles: number;
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
    porcentajeCompletitud: number;
    cargaTotalUtilizada: number;
    tiempoTotalEntrenamiento: number;
    // Nuevas métricas cuantitativas
    seriesTotales: number;
    repeticionesTotales: number;
    distribucionTipoEjercicio: {
      fuerza: number;
      cardio: number;
      movilidad: number;
      hiit: number;
      resistencia: number;
      potencia: number;
      estabilidad: number;
      flexibilidad: number;
    };
    // Métricas de cardio (si aplica)
    distanciaCardio: number; // en km
    tiempoCardio: number; // en minutos
  };
  // Información cualitativa
  percepcionEsfuerzo: {
    promedioRPE: number;
    distribucionRPE: {
      ligero: number; // RPE 1-4
      moderado: number; // RPE 5-7
      intenso: number; // RPE 8-10
    };
  };
  // Comparación con semana anterior
  comparacionSemanaAnterior: {
    sesionesCompletadas: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    tiempoEntrenamiento: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    cargaUtilizada: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
    seriesCompletadas: {
      actual: number;
      anterior: number;
      diferencia: number;
      porcentajeCambio: number;
    };
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

export interface RachasEntrenamiento {
  rachaActual: {
    dias: number;
    semanas: number;
  };
  rachaMaxima: {
    dias: number;
    semanas: number;
    fechaInicio: Date | null;
    fechaFin: Date | null;
  };
  ultimaSesion: Date | null;
  diasSinEntrenar: number;
}

// Servicio principal de estadísticas
export async function obtenerEstadisticasClienteService(
  clienteId: string,
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<EstadisticasCliente> {
  try {
    // Validar y sanitizar el clienteId
    const sanitizedClienteId = validateAndSanitizeObjectId(clienteId, 'clienteId');
    
    logger.info('Obteniendo estadísticas del cliente', { clienteId: sanitizedClienteId.toString(), fechaInicio, fechaFin });

    // Establecer fechas por defecto (últimos 3 meses para estadísticas generales)
    const fin = fechaFin || new Date();
    const inicio = fechaInicio || new Date(fin.getFullYear(), fin.getMonth() - 2, 1); // Últimos 3 meses
    const finMesCompleto = new Date(fin.getFullYear(), fin.getMonth() + 1, 0, 23, 59, 59, 999);

    // Obtener todas las sesiones del cliente (sin filtro de fecha para estadísticas generales)
    const sesiones = await Sesion.find({
      cliente: sanitizedClienteId
    }).populate('ejercicios.ejercicio');

    // Obtener registros de ejercicios del cliente en el período
    const registros = await RegistroEjercicio.find({
      cliente: sanitizedClienteId,
      fecha: { $gte: inicio, $lte: finMesCompleto }
    }).populate('ejercicio');

    // Calcular estadísticas de asistencia
    const sesionesProgramadas = sesiones.length;
    const sesionesCompletadas = sesiones.filter((s: any) => s.completada).length;
    const porcentajeAsistencia = sesionesProgramadas > 0 ? (sesionesCompletadas / sesionesProgramadas) * 100 : 0;
    const sesionesAtrasadas = sesiones.filter((s: any) => {
      const fechaSesion = new Date(s.fecha);
      const hoy = new Date();
      // Solo considerar atrasadas las sesiones que ya pasaron y no se completaron
      return fechaSesion < hoy && !s.completada;
    }).length;
    
    logger.info('Cálculo de estadísticas generales del cliente', {
      clienteId: sanitizedClienteId,
      periodo: { inicio, fin: finMesCompleto },
      sesionesProgramadas,
      sesionesCompletadas,
      porcentajeAsistencia,
      registrosTotal: registros.length,
      sesiones: sesiones.map(s => ({ 
        fecha: s.fecha, 
        completada: s.completada,
        id: s._id 
      }))
    });

    // Calcular progreso de ejercicios
    const progresoEjercicios = await calcularProgresoEjercicios(registros);

    // Calcular consistencia (basado en sesiones completadas, no días de registros)
    const diasConSesiones = new Set(sesiones.filter((s: any) => s.completada).map((s: any) => new Date(s.fecha).toDateString())).size;
    const diasTotales = Math.ceil((finMesCompleto.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const porcentajeConsistencia = diasTotales > 0 ? (diasConSesiones / diasTotales) * 100 : 0;

    // Calcular rendimiento
    const tiempoPromedioSesion = await calcularTiempoPromedioSesion(registros);
    const ejerciciosCompletados = registros.filter((r: any) => r.completado).length;
    const ejerciciosTotal = registros.length;
    const porcentajeCompletitud = ejerciciosTotal > 0 ? (ejerciciosCompletados / ejerciciosTotal) * 100 : 0;


    const estadisticas: EstadisticasCliente = {
      clienteId,
      periodo: { inicio, fin: finMesCompleto },
      asistencia: {
        sesionesProgramadas,
        sesionesCompletadas,
        porcentajeAsistencia,
        sesionesAtrasadas
      },
      progresoEjercicios,
      consistencia: {
        diasEntrenados: diasConSesiones,
        diasDisponibles: diasTotales,
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
    // Validar y sanitizar el clienteId
    const sanitizedClienteId = validateAndSanitizeObjectId(clienteId, 'clienteId');
    
    // Validar parámetros numéricos
    if (!Number.isInteger(numeroSemana) || numeroSemana < 1 || numeroSemana > 53) {
      throw new Error('Número de semana debe ser un entero entre 1 y 53');
    }
    
    if (!Number.isInteger(año) || año < 1900 || año > 2100) {
      throw new Error('Año debe ser un entero entre 1900 y 2100');
    }
    
    logger.info('Obteniendo estadísticas semanales', { clienteId: sanitizedClienteId.toString(), numeroSemana, año });

    // Calcular fechas de la semana actual
    const inicioSemana = new Date(año, 0, 1);
    const diasHastaSemana = (numeroSemana - 1) * 7;
    const inicio = new Date(inicioSemana.getTime() + diasHastaSemana * 24 * 60 * 60 * 1000);
    const fin = new Date(inicio.getTime() + 6 * 24 * 60 * 60 * 1000);

    // Calcular fechas de la semana anterior para comparación
    const inicioSemanaAnterior = new Date(inicio.getTime() - 7 * 24 * 60 * 60 * 1000);
    const finSemanaAnterior = new Date(fin.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Obtener sesiones de la semana actual
    const sesiones = await Sesion.find({
      cliente: sanitizedClienteId,
      fecha: { $gte: inicio, $lte: fin }
    });

    // Obtener registros de la semana actual
    const registros = await RegistroEjercicio.find({
      cliente: sanitizedClienteId,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('ejercicio');

    // Obtener registros de la semana anterior para comparación
    const registrosSemanaAnterior = await RegistroEjercicio.find({
      cliente: sanitizedClienteId,
      fecha: { $gte: inicioSemanaAnterior, $lte: finSemanaAnterior }
    });

    // Calcular estadísticas de asistencia
    const sesionesProgramadas = sesiones.length;
    const sesionesCompletadas = sesiones.filter((s: any) => s.completada).length;
    const porcentajeAsistencia = sesionesProgramadas > 0 ? (sesionesCompletadas / sesionesProgramadas) * 100 : 0;

    // Calcular métricas cuantitativas básicas
    const ejerciciosRegistrados = registros.length;
    const ejerciciosCompletados = registros.filter((r: any) => r.completado).length;
    const porcentajeCompletitud = ejerciciosRegistrados > 0 ? (ejerciciosCompletados / ejerciciosRegistrados) * 100 : 0;
    const cargaTotalUtilizada = registros.reduce((sum: number, r: any) => sum + (r.cargaUtilizada || 0), 0);
    
    // Calcular tiempo total de entrenamiento basado en duración de sesiones completadas
    // sesionesCompletadas es un número, no un array, así que necesitamos filtrar las sesiones completadas reales
    const sesionesCompletadasArray = sesiones.filter((s: any) => s.completada);
    const tiempoTotalEntrenamiento = sesionesCompletadasArray.reduce((sum: number, s: any) => sum + (s.duracion || 0), 0);

    // Nuevas métricas cuantitativas
    const seriesTotales = registros.reduce((sum: number, r: any) => sum + (r.seriesCompletadas || 0), 0);
    const repeticionesTotales = registros.reduce((sum: number, r: any) => sum + (r.repeticionesRealizadas || 0), 0);

    // Distribución por tipo de ejercicio
    const distribucionTipoEjercicio = {
      fuerza: 0,
      cardio: 0,
      movilidad: 0,
      hiit: 0,
      resistencia: 0,
      potencia: 0,
      estabilidad: 0,
      flexibilidad: 0
    };

    registros.forEach((r: any) => {
      if (r.ejercicio && r.ejercicio.tipoEjercicio) {
        const tipo = r.ejercicio.tipoEjercicio.toLowerCase();
        if (tipo in distribucionTipoEjercicio) {
          distribucionTipoEjercicio[tipo as keyof typeof distribucionTipoEjercicio]++;
        }
      }
    });

    // Métricas de cardio
    const registrosCardio = registros.filter((r: any) => 
      r.ejercicio && ['cardio', 'hiit', 'resistencia'].includes(r.ejercicio.tipoEjercicio?.toLowerCase())
    );
    const tiempoCardio = registrosCardio.reduce((sum: number, r: any) => sum + (r.duracionEjercicio || 0), 0);
    const distanciaCardio = registrosCardio.reduce((sum: number, r: any) => sum + (r.distanciaRecorrida || 0), 0);

    // Percepción del esfuerzo (RPE)
    const nivelesEsfuerzo = registros.map((r: any) => r.nivelEsfuerzo || 0).filter(n => n > 0);
    const promedioRPE = nivelesEsfuerzo.length > 0 ? nivelesEsfuerzo.reduce((sum, n) => sum + n, 0) / nivelesEsfuerzo.length : 0;
    
    const distribucionRPE = {
      ligero: nivelesEsfuerzo.filter(n => n >= 1 && n <= 4).length,
      moderado: nivelesEsfuerzo.filter(n => n >= 5 && n <= 7).length,
      intenso: nivelesEsfuerzo.filter(n => n >= 8 && n <= 10).length
    };

    // Obtener sesiones de la semana anterior para calcular tiempo correctamente
    const sesionesSemanaAnterior = await Sesion.find({
      cliente: sanitizedClienteId,
      fecha: { $gte: inicioSemanaAnterior, $lte: finSemanaAnterior }
    });
    
    // Comparación con semana anterior
    const sesionesCompletadasAnterior = sesionesSemanaAnterior.filter((s: any) => s.completada).length;
    const tiempoEntrenamientoAnterior = sesionesSemanaAnterior.filter((s: any) => s.completada).reduce((sum: number, s: any) => sum + (s.duracion || 0), 0);
    const cargaUtilizadaAnterior = registrosSemanaAnterior.reduce((sum: number, r: any) => sum + (r.cargaUtilizada || 0), 0);
    const seriesCompletadasAnterior = registrosSemanaAnterior.reduce((sum: number, r: any) => sum + (r.seriesCompletadas || 0), 0);

    const comparacionSemanaAnterior = {
      sesionesCompletadas: {
        actual: sesionesCompletadas,
        anterior: sesionesCompletadasAnterior,
        diferencia: sesionesCompletadas - sesionesCompletadasAnterior,
        porcentajeCambio: sesionesCompletadasAnterior > 0 ? 
          ((sesionesCompletadas - sesionesCompletadasAnterior) / sesionesCompletadasAnterior) * 100 : 0
      },
      tiempoEntrenamiento: {
        actual: tiempoTotalEntrenamiento,
        anterior: tiempoEntrenamientoAnterior,
        diferencia: tiempoTotalEntrenamiento - tiempoEntrenamientoAnterior,
        porcentajeCambio: tiempoEntrenamientoAnterior > 0 ? 
          ((tiempoTotalEntrenamiento - tiempoEntrenamientoAnterior) / tiempoEntrenamientoAnterior) * 100 : 0
      },
      cargaUtilizada: {
        actual: cargaTotalUtilizada,
        anterior: cargaUtilizadaAnterior,
        diferencia: cargaTotalUtilizada - cargaUtilizadaAnterior,
        porcentajeCambio: cargaUtilizadaAnterior > 0 ? 
          ((cargaTotalUtilizada - cargaUtilizadaAnterior) / cargaUtilizadaAnterior) * 100 : 0
      },
      seriesCompletadas: {
        actual: seriesTotales,
        anterior: seriesCompletadasAnterior,
        diferencia: seriesTotales - seriesCompletadasAnterior,
        porcentajeCambio: seriesCompletadasAnterior > 0 ? 
          ((seriesTotales - seriesCompletadasAnterior) / seriesCompletadasAnterior) * 100 : 0
      }
    };

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
        porcentajeCompletitud,
        cargaTotalUtilizada,
        tiempoTotalEntrenamiento,
        seriesTotales,
        repeticionesTotales,
        distribucionTipoEjercicio,
        distanciaCardio,
        tiempoCardio
      },
      percepcionEsfuerzo: {
        promedioRPE: Math.round(promedioRPE * 10) / 10,
        distribucionRPE
      },
      comparacionSemanaAnterior,
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

// Función para calcular rachas de entrenamiento
export async function obtenerRachasEntrenamientoService(clienteId: string): Promise<RachasEntrenamiento> {
  try {
    // Validar y sanitizar el clienteId
    const sanitizedClienteId = validateAndSanitizeObjectId(clienteId, 'clienteId');
    
    // Obtener todos los registros del cliente ordenados por fecha
    const registros = await RegistroEjercicio.find({
      cliente: sanitizedClienteId,
      completado: true
    }).sort({ fecha: 1 });

    if (registros.length === 0) {
      // Si no hay registros, calcular días desde que tiene un plan asignado
      let diasSinEntrenar = 0;
      
      try {
        // Buscar el plan de entrenamiento más antiguo del cliente
        const planMasAntiguo = await PlanEntrenamiento.findOne({
          clientes: sanitizedClienteId,
          draftMode: false
        }).sort({ fechaInicio: 1 });
        
        if (planMasAntiguo) {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          const fechaInicioPlan = new Date(planMasAntiguo.fechaInicio);
          fechaInicioPlan.setHours(0, 0, 0, 0);
          
          // Calcular días desde el inicio del plan
          diasSinEntrenar = Math.max(0, Math.floor((hoy.getTime() - fechaInicioPlan.getTime()) / (1000 * 60 * 60 * 24)));
        }
      } catch (error) {
        logger.warn('Error al calcular días sin entrenar para cliente sin registros', { clienteId, error });
      }
      
      return {
        rachaActual: { dias: 0, semanas: 0 },
        rachaMaxima: { dias: 0, semanas: 0, fechaInicio: null, fechaFin: null },
        ultimaSesion: null,
        diasSinEntrenar
      };
    }

    // Agrupar registros por fecha
    const registrosPorFecha = new Map<string, any[]>();
    registros.forEach((r: any) => {
      const fecha = r.fecha.toISOString().split('T')[0];
      if (!registrosPorFecha.has(fecha)) {
        registrosPorFecha.set(fecha, []);
      }
      registrosPorFecha.get(fecha)!.push(r);
    });

    const fechasEntrenamiento = Array.from(registrosPorFecha.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    const ultimaSesion = new Date(registros[registros.length - 1].fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    ultimaSesion.setHours(0, 0, 0, 0);
    const diasSinEntrenar = Math.floor((hoy.getTime() - ultimaSesion.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular racha actual
    let rachaActualDias = 0;
    let rachaActualSemanas = 0;
    
    // Buscar hacia atrás desde hoy
    const fechaActual = new Date(hoy);
    while (fechasEntrenamiento.includes(fechaActual.toISOString().split('T')[0])) {
      rachaActualDias++;
      fechaActual.setDate(fechaActual.getDate() - 1);
    }
    
    rachaActualSemanas = Math.floor(rachaActualDias / 7);

    // Calcular racha máxima
    let rachaMaximaDias = 0;
    let rachaMaximaSemanas = 0;
    let fechaInicioRachaMax = null;
    let fechaFinRachaMax = null;
    
    let rachaActualTemp = 0;
    let fechaInicioTemp = null;
    
    for (let i = 0; i < fechasEntrenamiento.length; i++) {
      const fechaActual = new Date(fechasEntrenamiento[i]);
      const fechaAnterior = i > 0 ? new Date(fechasEntrenamiento[i - 1]) : null;
      
      if (!fechaAnterior || fechaActual.getTime() - fechaAnterior.getTime() === 24 * 60 * 60 * 1000) {
        // Día consecutivo
        rachaActualTemp++;
        if (fechaInicioTemp === null) {
          fechaInicioTemp = fechaActual;
        }
      } else {
        // Racha rota
        if (rachaActualTemp > rachaMaximaDias) {
          rachaMaximaDias = rachaActualTemp;
          fechaInicioRachaMax = fechaInicioTemp;
          fechaFinRachaMax = new Date(fechasEntrenamiento[i - 1]);
        }
        rachaActualTemp = 1;
        fechaInicioTemp = fechaActual;
      }
    }
    
    // Verificar si la última racha es la máxima
    if (rachaActualTemp > rachaMaximaDias) {
      rachaMaximaDias = rachaActualTemp;
      fechaInicioRachaMax = fechaInicioTemp;
      fechaFinRachaMax = new Date(fechasEntrenamiento[fechasEntrenamiento.length - 1]);
    }
    
    rachaMaximaSemanas = Math.floor(rachaMaximaDias / 7);

    return {
      rachaActual: {
        dias: rachaActualDias,
        semanas: rachaActualSemanas
      },
      rachaMaxima: {
        dias: rachaMaximaDias,
        semanas: rachaMaximaSemanas,
        fechaInicio: fechaInicioRachaMax,
        fechaFin: fechaFinRachaMax
      },
      ultimaSesion,
      diasSinEntrenar: Math.max(0, diasSinEntrenar)
    };

  } catch (error) {
    logger.error('Error al calcular rachas de entrenamiento', {
      error: error instanceof Error ? error.message : String(error),
      clienteId
    });
    throw new Error('Error al calcular rachas de entrenamiento');
  }
}

export async function obtenerProgresoEjerciciosService(
  clienteId: string,
  ejercicioId?: string
): Promise<any[]> {
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

    const progresoEjercicios: any[] = [];

    ejerciciosMap.forEach((registrosEjercicio, ejercicioId) => {
      const ejercicio = registrosEjercicio[0].ejercicio;
      const ejercicioNombre = typeof ejercicio === 'string' ? 'Ejercicio' : (ejercicio as any).nombre;
      const grupoMuscular = typeof ejercicio === 'string' ? 'Sin grupo' : (ejercicio as any).grupoMuscular || 'Sin grupo';

      const cargas = registrosEjercicio.map((r: any) => r.cargaUtilizada || 0);
      const repeticiones = registrosEjercicio.map((r: any) => r.repeticionesRealizadas || 0);

      const series = registrosEjercicio.map((r: any) => r.seriesCompletadas || 0);
      
      const estadisticas = {
        cargaMaxima: cargas.length > 0 ? Math.max(...cargas) : 0,
        repeticionesMaximas: repeticiones.length > 0 ? Math.max(...repeticiones) : 0,
        seriesMaximas: series.length > 0 ? Math.max(...series) : 0,
        promedioSesiones: registrosEjercicio.length,
        totalSesiones: registrosEjercicio.length
      };

      // Calcular tendencia basada en las últimas cargas
      const tendencia = calcularTendencia(cargas);

      // Calcular mejoras (simplificado)
      const mejoraCarga = cargas.length > 1 ? ((cargas[cargas.length - 1] - cargas[0]) / cargas[0]) * 100 : 0;
      const mejoraRepeticiones = repeticiones.length > 1 ? ((repeticiones[repeticiones.length - 1] - repeticiones[0]) / repeticiones[0]) * 100 : 0;
      const mejoraSeries = series.length > 1 ? ((series[series.length - 1] - series[0]) / series[0]) * 100 : 0;

      const progreso = {
        mejoraCarga,
        mejoraRepeticiones,
        mejoraSeries,
        tendencia
      };

      progresoEjercicios.push({
        ejercicioId,
        ejercicioNombre,
        grupoMuscular,
        registros: registrosEjercicio.map((r: any) => ({
          fecha: r.fecha,
          cargaUtilizada: r.cargaUtilizada || 0,
          repeticionesRealizadas: r.repeticionesRealizadas || 0,
          seriesCompletadas: r.seriesCompletadas || 0,
          nivelEsfuerzo: r.nivelEsfuerzo || 0,
          completado: r.completado || false
        })),
        estadisticas,
        progreso
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
  grupoMuscular: string;
  registros: {
    fecha: string;
    cargaUtilizada: number;
    repeticionesRealizadas: number;
    seriesCompletadas: number;
    nivelEsfuerzo: number;
    completado: boolean;
  }[];
  progreso: {
    mejoraCarga: number;
    mejoraRepeticiones: number;
    mejoraSeries: number;
    tendencia: 'mejora' | 'estable' | 'baja';
  };
  estadisticas: {
    cargaMaxima: number;
    repeticionesMaximas: number;
    seriesMaximas: number;
    promedioSesiones: number;
    totalSesiones: number;
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
    grupoMuscular: string;
    registros: {
      fecha: string;
      cargaUtilizada: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      completado: boolean;
    }[];
    progreso: {
      mejoraCarga: number;
      mejoraRepeticiones: number;
      mejoraSeries: number;
      tendencia: 'mejora' | 'estable' | 'baja';
    };
    estadisticas: {
      cargaMaxima: number;
      repeticionesMaximas: number;
      seriesMaximas: number;
      promedioSesiones: number;
      totalSesiones: number;
    };
  }[] = [];

  ejerciciosMap.forEach((registrosEjercicio, ejercicioId) => {
    const ejercicio = registrosEjercicio[0].ejercicio;
    const ejercicioNombre = typeof ejercicio === 'string' ? 'Ejercicio' : (ejercicio as any).nombre;
    const grupoMuscular = typeof ejercicio === 'string' ? 'General' : (ejercicio as any).grupoMuscular || 'General';

    const cargas = registrosEjercicio.map((r: any) => r.cargaUtilizada || 0);
    const repeticiones = registrosEjercicio.map((r: any) => r.repeticionesRealizadas || 0);
    const series = registrosEjercicio.map((r: any) => r.seriesCompletadas || 0);

    const cargaMaxima = Math.max(...cargas);
    const repeticionesMaximas = Math.max(...repeticiones);
    const seriesMaximas = Math.max(...series);
    const totalSesiones = registrosEjercicio.length;

    // Calcular tendencia (simplificado)
    const tendencia = calcularTendencia(cargas);

    // Calcular mejoras (simplificado)
    const mejoraCarga = cargas.length > 1 ? ((cargas[cargas.length - 1] - cargas[0]) / cargas[0]) * 100 : 0;
    const mejoraRepeticiones = repeticiones.length > 1 ? ((repeticiones[repeticiones.length - 1] - repeticiones[0]) / repeticiones[0]) * 100 : 0;
    const mejoraSeries = series.length > 1 ? ((series[series.length - 1] - series[0]) / series[0]) * 100 : 0;

    progresoEjercicios.push({
      ejercicioId,
      ejercicioNombre,
      grupoMuscular,
      registros: registrosEjercicio.map((r: any) => ({
        fecha: r.fecha,
        cargaUtilizada: r.cargaUtilizada || 0,
        repeticionesRealizadas: r.repeticionesRealizadas || 0,
        seriesCompletadas: r.seriesCompletadas || 0,
        nivelEsfuerzo: r.nivelEsfuerzo || 0,
        completado: r.completado || false
      })),
      progreso: {
        mejoraCarga,
        mejoraRepeticiones,
        mejoraSeries,
        tendencia
      },
      estadisticas: {
        cargaMaxima,
        repeticionesMaximas,
        seriesMaximas,
        promedioSesiones: totalSesiones,
        totalSesiones
      }
    });
  });

  return progresoEjercicios;
}

async function calcularTiempoPromedioSesion(registros: any[]): Promise<number> {
  // Obtener sesiones únicas de los registros
  const sesionesIds = [...new Set(registros.map((r: any) => r.sesion.toString()))];
  
  if (sesionesIds.length === 0) return 0;
  
  // Obtener las sesiones de la base de datos para obtener la duración real
  const sesiones = await Sesion.find({ 
    _id: { $in: sesionesIds.map(id => new mongoose.Types.ObjectId(id)) }
  }).select('duracion completada');
  
  // Filtrar solo sesiones completadas y sumar duraciones
  const sesionesCompletadas = sesiones.filter(s => s.completada);
  const tiempoTotal = sesionesCompletadas.reduce((sum, s) => sum + (s.duracion || 0), 0);
  
  return sesionesCompletadas.length > 0 ? tiempoTotal / sesionesCompletadas.length : 0;
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

// Obtener clientes de un trabajador con sus estadísticas
export const obtenerClientesTrabajadorService = async (trabajadorId: string, semana?: number, año?: number) => {
  try {
    // Validar ID del trabajador
    if (!mongoose.Types.ObjectId.isValid(trabajadorId)) {
      throw new Error('ID de trabajador no válido');
    }

    // Obtener planes de entrenamiento del trabajador (incluyendo borradores para debug)
    const planes = await PlanEntrenamiento.find({ 
      entrenador: new mongoose.Types.ObjectId(trabajadorId),
      activo: true
      // Removido draftMode: false temporalmente para debug
    }).populate('clientes', 'fullName email');

    logger.info('Planes encontrados para trabajador', { 
      trabajadorId, 
      cantidadPlanes: planes.length,
      planes: planes.map(p => ({ id: p._id, nombre: p.nombre, activo: p.activo, draftMode: p.draftMode, clientes: p.clientes.length }))
    });

    if (!planes || planes.length === 0) {
      logger.warn('No se encontraron planes para el trabajador', { trabajadorId });
      return {
        success: true,
        clientes: [],
        resumen: {
          totalClientes: 0,
          clientesActivos: 0,
          clientesInactivos: 0,
          cumplimientoPromedio: 0,
          sesionesPromedio: 0,
          distribucionTipos: {}
        }
      };
    }

    // Obtener todos los clientes únicos
    const clientesIds = [...new Set(planes.flatMap((plan: any) => plan.clientes.map((cliente: any) => cliente._id)))];
    
    const clientesConEstadisticas = await Promise.all(
      clientesIds.map(async (clienteId: any) => {
        try {
          // Obtener información del cliente primero
          const cliente = await User.findById(clienteId).select('fullName email');
          
          if (!cliente) {
            console.warn(`Cliente ${clienteId} no encontrado`);
            return null;
          }

          // Obtener estadísticas generales del cliente con manejo de errores
          let estadisticasGenerales;
          try {
            estadisticasGenerales = await obtenerEstadisticasClienteService(clienteId.toString());
          } catch (error) {
            console.warn(`Error obteniendo estadísticas generales del cliente ${clienteId}:`, error);
            // Crear estadísticas por defecto
            estadisticasGenerales = {
              clienteId: clienteId.toString(),
              periodo: {
                inicio: new Date(),
                fin: new Date()
              },
              asistencia: {
                sesionesProgramadas: 0,
                sesionesCompletadas: 0,
                porcentajeAsistencia: 0,
                sesionesAtrasadas: 0
              },
              progresoEjercicios: [],
              consistencia: {
                diasEntrenados: 0,
                diasDisponibles: 0,
                porcentajeConsistencia: 0
              },
              rendimiento: {
                tiempoPromedioSesion: 0,
                ejerciciosCompletados: 0,
                ejerciciosTotal: 0,
                porcentajeCompletitud: 0
              }
            };
          }
          
          // Obtener estadísticas semanales con manejo de errores
          let estadisticasSemanales;
          try {
            const semanaActual = semana || getCurrentWeekNumber();
            const añoActual = año || new Date().getFullYear();
            estadisticasSemanales = await obtenerEstadisticasSemanalService(clienteId.toString(), semanaActual, añoActual);
          } catch (error) {
            console.warn(`Error obteniendo estadísticas semanales del cliente ${clienteId}:`, error);
            // Crear estadísticas semanales por defecto
            estadisticasSemanales = {
              semana: {
                numero: semana || getCurrentWeekNumber(),
                inicio: new Date(),
                fin: new Date()
              },
              asistencia: {
                sesionesProgramadas: 0,
                sesionesCompletadas: 0,
                porcentajeAsistencia: 0
              },
              progreso: {
                ejerciciosRegistrados: 0,
                ejerciciosCompletados: 0,
                porcentajeCompletitud: 0,
                cargaTotalUtilizada: 0,
                tiempoTotalEntrenamiento: 0,
                seriesTotales: 0,
                repeticionesTotales: 0,
                distribucionTipoEjercicio: {
                  fuerza: 0,
                  cardio: 0,
                  movilidad: 0,
                  hiit: 0,
                  resistencia: 0,
                  potencia: 0,
                  estabilidad: 0,
                  flexibilidad: 0
                },
                distanciaCardio: 0,
                tiempoCardio: 0
              },
              percepcionEsfuerzo: {
                promedioRPE: 0,
                distribucionRPE: {
                  ligero: 0,
                  moderado: 0,
                  intenso: 0
                }
              },
              comparacionSemanaAnterior: {
                sesionesCompletadas: { actual: 0, anterior: 0, diferencia: 0, porcentajeCambio: 0 },
                tiempoEntrenamiento: { actual: 0, anterior: 0, diferencia: 0, porcentajeCambio: 0 },
                cargaUtilizada: { actual: 0, anterior: 0, diferencia: 0, porcentajeCambio: 0 },
                seriesCompletadas: { actual: 0, anterior: 0, diferencia: 0, porcentajeCambio: 0 }
              },
              tendencias: {
                ejerciciosEnMejora: 0,
                ejerciciosEstables: 0,
                ejerciciosEnBaja: 0,
                tendenciaGeneral: 'estable' as const
              },
              resumen: {
                tiempoTotalEntrenado: 0,
                cargaTotalLevantada: 0,
                repeticionesTotales: 0
              }
            };
          }
          
          // Obtener rachas de entrenamiento con manejo de errores
          let rachas;
          try {
            rachas = await obtenerRachasEntrenamientoService(clienteId.toString());
          } catch (error) {
            console.warn(`Error obteniendo rachas del cliente ${clienteId}:`, error);
            // Crear rachas por defecto
            rachas = {
              rachaActual: { dias: 0, semanas: 0 },
              rachaMaxima: { dias: 0, semanas: 0, fechaInicio: null, fechaFin: null },
              ultimaSesion: null,
              diasSinEntrenar: 999
            };
          }
          
          // Calcular alertas
          const alertas = [];
          
          // Verificar si el cliente nunca ha registrado ejercicios
          if (!rachas.ultimaSesion && rachas.diasSinEntrenar > 0) {
            alertas.push(`Cliente nunca ha registrado ejercicios - ${rachas.diasSinEntrenar} días desde asignación del plan`);
          } else if (rachas.diasSinEntrenar > 3) {
            alertas.push(`Cliente inactivo - no entrena desde hace ${rachas.diasSinEntrenar} días`);
          }
          
          if (estadisticasGenerales.rendimiento.porcentajeCompletitud < 60) {
            alertas.push('Bajo cumplimiento del plan semanal');
          }
          if (estadisticasSemanales.asistencia.porcentajeAsistencia < 50) {
            alertas.push('Baja asistencia esta semana');
          }

          return {
            id: clienteId.toString(),
            nombre: cliente.fullName,
            email: cliente.email,
            estadisticas: estadisticasGenerales,
            estadisticasSemanal: estadisticasSemanales,
            rachas: rachas,
            ultimaSesion: rachas.ultimaSesion,
            alertas: alertas,
            notas: '' // TODO: Implementar sistema de notas
          };
        } catch (error) {
          console.error(`Error general obteniendo datos del cliente ${clienteId}:`, error);
          return null;
        }
      })
    );

    // Filtrar clientes nulos
    const clientes = clientesConEstadisticas.filter(cliente => cliente !== null);

    // Calcular resumen agregado usando estadísticas generales
    const cumplimientoPromedio = clientes.length > 0 ? 
      clientes.reduce((acc, c) => {
        const porcentaje = c.estadisticas?.asistencia?.porcentajeAsistencia || 0;
        return acc + porcentaje;
      }, 0) / clientes.length : 0;
    
    const sesionesPromedio = clientes.length > 0 ? 
      clientes.reduce((acc, c) => {
        const sesiones = c.estadisticas?.asistencia?.sesionesCompletadas || 0;
        return acc + sesiones;
      }, 0) / clientes.length : 0;

    const resumen = {
      totalClientes: clientes.length,
      clientesActivos: clientes.filter(c => c.rachas.diasSinEntrenar <= 3).length,
      clientesInactivos: clientes.filter(c => c.rachas.diasSinEntrenar > 3).length,
      cumplimientoPromedio,
      sesionesPromedio,
      distribucionTipos: clientes.reduce((acc, cliente) => {
        const distribucion = cliente.estadisticasSemanal?.progreso?.distribucionTipoEjercicio || {};
        Object.entries(distribucion).forEach(([tipo, cantidad]) => {
          acc[tipo] = (acc[tipo] || 0) + cantidad;
        });
        return acc;
      }, {} as Record<string, number>)
    };

    logger.info('Cálculo de resumen de trabajador', {
      trabajadorId,
      totalClientes: clientes.length,
      clientesConEstadisticasGenerales: clientes.filter(c => c.estadisticas).length,
      clientesConEstadisticasSemanal: clientes.filter(c => c.estadisticasSemanal).length,
      cumplimientoPromedio,
      sesionesPromedio,
      clientes: clientes.map(c => ({
        id: c.id,
        nombre: c.nombre,
        tieneEstadisticasGenerales: !!c.estadisticas,
        tieneEstadisticasSemanal: !!c.estadisticasSemanal,
        porcentajeAsistenciaGeneral: c.estadisticas?.asistencia?.porcentajeAsistencia || 0,
        sesionesCompletadasGeneral: c.estadisticas?.asistencia?.sesionesCompletadas || 0,
        sesionesProgramadasGeneral: c.estadisticas?.asistencia?.sesionesProgramadas || 0,
        porcentajeAsistenciaSemanal: c.estadisticasSemanal?.asistencia?.porcentajeAsistencia || 0,
        sesionesCompletadasSemanal: c.estadisticasSemanal?.asistencia?.sesionesCompletadas || 0
      }))
    });

    return {
      success: true,
      clientes,
      resumen
    };

  } catch (error) {
    console.error('Error en obtenerClientesTrabajadorService:', error);
    throw new Error('Error al obtener datos de clientes del trabajador');
  }
};

// Obtener detalles completos de un cliente específico
export const obtenerDetallesClienteService = async (trabajadorId: string, clienteId: string) => {
  try {
    // Validar y sanitizar los IDs
    const sanitizedTrabajadorId = validateAndSanitizeObjectId(trabajadorId, 'trabajadorId');
    const sanitizedClienteId = validateAndSanitizeObjectId(clienteId, 'clienteId');

    // Verificar que el trabajador tiene acceso al cliente
    const planes = await PlanEntrenamiento.find({ 
      entrenador: sanitizedTrabajadorId,
      clientes: sanitizedClienteId,
      activo: true,
      draftMode: false // Solo planes publicados
    }).populate('sesiones');

    if (planes.length === 0) {
      throw new Error('Cliente no encontrado o sin acceso');
    }

    // Obtener información del cliente
    const cliente = await User.findById(sanitizedClienteId).select('fullName email');
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener todas las sesiones del cliente (sin filtro de fecha para detalles)
    const sesiones = await Sesion.find({ 
      cliente: sanitizedClienteId
    })
      .populate('ejercicios.ejercicio')
      .sort({ fecha: -1 }); // Ordenar por fecha descendente (más recientes primero)

    // Obtener todos los registros de ejercicios del cliente (últimos 3 meses)
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
    const finMesCompleto = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const registros = await RegistroEjercicio.find({ 
      cliente: sanitizedClienteId,
      fecha: { $gte: inicio, $lte: finMesCompleto }
    })
      .populate('ejercicio')
      .populate('sesion')
      .sort({ fecha: -1 });

    logger.info('Detalles del cliente obtenidos', {
      trabajadorId: sanitizedTrabajadorId,
      clienteId: sanitizedClienteId,
      sesionesEncontradas: sesiones.length,
      registrosEncontrados: registros.length,
      periodo: { inicio, fin: finMesCompleto }
    });

    // Obtener estadísticas del cliente
    const estadisticasGenerales = await obtenerEstadisticasClienteService(sanitizedClienteId.toString());
    const semanaActual = getCurrentWeekNumber();
    const añoActual = new Date().getFullYear();
    const estadisticasSemanales = await obtenerEstadisticasSemanalService(sanitizedClienteId.toString(), semanaActual, añoActual);
    const rachas = await obtenerRachasEntrenamientoService(sanitizedClienteId.toString());

    // Calcular alertas
    const alertas = [];
    
    // Verificar si el cliente nunca ha registrado ejercicios
    if (!rachas.ultimaSesion && rachas.diasSinEntrenar > 0) {
      alertas.push(`Cliente nunca ha registrado ejercicios - ${rachas.diasSinEntrenar} días desde asignación del plan`);
    } else if (rachas.diasSinEntrenar > 3) {
      alertas.push(`Cliente inactivo - no entrena desde hace ${rachas.diasSinEntrenar} días`);
    }
    
    if (estadisticasGenerales.rendimiento.porcentajeCompletitud < 60) {
      alertas.push('Bajo cumplimiento del plan semanal');
    }
    if (estadisticasSemanales.asistencia.porcentajeAsistencia < 50) {
      alertas.push('Baja asistencia esta semana');
    }

    return {
      success: true,
      cliente: {
        id: clienteId,
        nombre: cliente.fullName,
        email: cliente.email,
        planes: planes.map(plan => ({
          id: plan._id,
          nombre: plan.nombre,
          objetivo: plan.objetivo,
          fechaInicio: plan.fechaInicio,
          duracionDias: plan.duracionDias,
          sesionesPorSemana: plan.sesionesPorSemana,
          sesiones: plan.sesiones.map((sesion: any) => ({
            id: sesion._id,
            nombre: sesion.nombre,
            tipoEntrenamiento: sesion.tipoEntrenamiento,
            fecha: sesion.fecha,
            completada: sesion.completada,
            ejercicios: sesion.ejercicios.map((ej: any) => ({
              id: ej.ejercicio?._id || 'sin-id',
              nombre: ej.ejercicio?.nombre || 'Ejercicio',
              series: ej.series,
              repeticiones: ej.repeticiones,
              peso: ej.peso || 0, // Convertir undefined a 0
              tiempoDescanso: ej.tiempoDescanso
            }))
          }))
        })),
        sesiones: sesiones.map((sesion: any) => ({
          id: sesion._id,
          nombre: sesion.nombre,
          tipoEntrenamiento: sesion.tipoEntrenamiento,
          fecha: sesion.fecha,
          completada: sesion.completada,
          ejercicios: sesion.ejercicios.map((ej: any) => ({
            id: ej.ejercicio?._id || 'sin-id',
            nombre: ej.ejercicio?.nombre || 'Ejercicio',
            series: ej.series,
            repeticiones: ej.repeticiones,
            peso: ej.peso || 0, // Convertir undefined a 0
            tiempoDescanso: ej.tiempoDescanso
          }))
        })),
        registros: registros.map((registro: any) => ({
          id: registro._id,
          ejercicio: {
            id: registro.ejercicio?._id || 'sin-id',
            nombre: registro.ejercicio?.nombre || 'Ejercicio'
          },
          sesion: {
            id: registro.sesion?._id || 'sin-id',
            nombre: registro.sesion?.nombre || 'Sesión',
            tipoEntrenamiento: registro.sesion?.tipoEntrenamiento || 'Fuerza',
            fecha: registro.sesion?.fecha || new Date(),
            completada: registro.sesion?.completada || false
          },
          cargaUtilizada: registro.cargaUtilizada,
          repeticionesRealizadas: registro.repeticionesRealizadas,
          seriesCompletadas: registro.seriesCompletadas,
          tiempoDescanso: registro.tiempoDescanso,
          nivelEsfuerzo: registro.nivelEsfuerzo,
          completado: registro.completado,
          notas: registro.notas,
          fecha: registro.fecha,
          videoCliente: registro.videoCliente
        })),
        estadisticas: estadisticasGenerales,
        estadisticasSemanal: estadisticasSemanales,
        rachas: rachas,
        alertas: alertas
      }
    };

  } catch (error) {
    console.error('Error en obtenerDetallesClienteService:', error);
    throw new Error('Error al obtener detalles del cliente');
  }
};

// Función auxiliar para obtener número de semana actual
export function getCurrentWeekNumber(): number {
  const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}