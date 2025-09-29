import Dieta from '../../models/diets/dieta';
import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { 
  SeguimientoPlato, 
  EstadisticasSeguimiento, 
  RespuestaSeguimientoPaginada
} from '../../types/seguimientoComida';

// Interfaces para los tipos de datos de Mongoose
interface DiaDietaType {
  comidas: Array<{
    nombreComida?: string;
    platos: Array<{
      satisfaccion?: number | null;
      cumplimiento?: number | null;
      notaUsuario?: string | null;
      nombre?: string;
    }>;
  }>;
}

interface ActualizarSeguimientoParams {
  userId: string;
  dietaId: string;
  diaIndex: number;
  comidaIndex: number;
  platoIndex: number;
  satisfaccion?: number;
  cumplimiento?: number;
  notaUsuario?: string;
}

interface ObtenerSeguimientoParams {
  userId: string;
  dietaId: string;
  diaIndex?: number;
  comidaIndex?: number;
  satisfaccionMinima?: number;
  cumplimientoMinimo?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit: number;
  offset: number;
}

interface ObtenerEstadisticasParams {
  userId: string;
  dietaId: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  incluirTendencias: boolean;
}

/**
 * Verificar que el usuario tiene acceso a la dieta (ver seguimiento)
 */
async function verificarAccesoDieta(userId: string, dietaId: string): Promise<typeof Dieta.prototype> {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inválido');
  }

  const dieta = await Dieta.findById(dietaId);
  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  // Verificar que el usuario está asignado a la dieta O es el creador
  const usuarioAsignado = dieta.asignadaA.some(id => id.toString() === userId);
  const esCreador = dieta.creador && dieta.creador.toString() === userId;
  
  if (!usuarioAsignado && !esCreador) {
    throw new Error('No tienes permisos para acceder a esta dieta');
  }

  return dieta;
}

/**
 * Verificar que el usuario puede editar el seguimiento (solo usuarios asignados)
 */
async function verificarPermisosEdicion(userId: string, dietaId: string): Promise<typeof Dieta.prototype> {
  if (!mongoose.Types.ObjectId.isValid(dietaId)) {
    throw new Error('ID de dieta inválido');
  }

  const dieta = await Dieta.findById(dietaId);
  if (!dieta) {
    throw new Error('Dieta no encontrada');
  }

  // Solo los usuarios asignados pueden editar el seguimiento
  const usuarioAsignado = dieta.asignadaA.some(id => id.toString() === userId);
  
  if (!usuarioAsignado) {
    throw new Error('Solo los usuarios asignados a la dieta pueden editar el seguimiento');
  }

  return dieta;
}

/**
 * Verificar que los índices son válidos
 */
function verificarIndices(dieta: typeof Dieta.prototype, diaIndex: number, comidaIndex: number, platoIndex: number): void {
  if (diaIndex < 0 || diaIndex >= dieta.dias.length) {
    throw new Error('Índice de día inválido');
  }

  const dia = dieta.dias[diaIndex];
  if (comidaIndex < 0 || comidaIndex >= dia.comidas.length) {
    throw new Error('Índice de comida inválido');
  }

  const comida = dia.comidas[comidaIndex];
  if (platoIndex < 0 || platoIndex >= comida.platos.length) {
    throw new Error('Índice de plato inválido');
  }
}

/**
 * Actualizar seguimiento de un plato específico
 */
export async function actualizarSeguimientoPlatoService({
  userId,
  dietaId,
  diaIndex,
  comidaIndex,
  platoIndex,
  satisfaccion,
  cumplimiento,
  notaUsuario
}: ActualizarSeguimientoParams): Promise<SeguimientoPlato> {
  try {
    // Verificar permisos de edición (solo usuarios asignados pueden editar)
    const dieta = await verificarPermisosEdicion(userId, dietaId);
    
    // Verificar índices
    verificarIndices(dieta, diaIndex, comidaIndex, platoIndex);

    // Actualizar el seguimiento
    const updateData: Record<string, number | string> = {};
    if (satisfaccion !== undefined) updateData[`dias.${diaIndex}.comidas.${comidaIndex}.platos.${platoIndex}.satisfaccion`] = satisfaccion;
    if (cumplimiento !== undefined) updateData[`dias.${diaIndex}.comidas.${comidaIndex}.platos.${platoIndex}.cumplimiento`] = cumplimiento;
    if (notaUsuario !== undefined) updateData[`dias.${diaIndex}.comidas.${comidaIndex}.platos.${platoIndex}.notaUsuario`] = notaUsuario;

    const dietaActualizada = await Dieta.findByIdAndUpdate(
      dietaId,
      { $set: updateData },
      { new: true }
    );

    if (!dietaActualizada) {
      throw new Error('Error al actualizar el seguimiento');
    }

    const platoActualizado = dietaActualizada.dias[diaIndex].comidas[comidaIndex].platos[platoIndex];
    
    logger.info('Seguimiento de plato actualizado', {
      userId,
      dietaId,
      diaIndex,
      comidaIndex,
      platoIndex,
      satisfaccion,
      cumplimiento,
      notaUsuario: notaUsuario ? 'proporcionada' : 'no proporcionada'
    });

    return {
      satisfaccion: platoActualizado.satisfaccion,
      cumplimiento: platoActualizado.cumplimiento,
      notaUsuario: platoActualizado.notaUsuario
    };
  } catch (error) {
    logger.error('Error en actualizarSeguimientoPlatoService', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      dietaId,
      diaIndex,
      comidaIndex,
      platoIndex
    });
    throw error;
  }
}

/**
 * Obtener seguimiento de platos con filtros y paginación
 */
export async function obtenerSeguimientoPlatosService({
  userId,
  dietaId,
  diaIndex,
  comidaIndex,
  satisfaccionMinima,
  cumplimientoMinimo,
  fechaDesde,
  fechaHasta,
  limit,
  offset
}: ObtenerSeguimientoParams): Promise<RespuestaSeguimientoPaginada> {
  try {
    // Verificar acceso a la dieta
    const dieta = await verificarAccesoDieta(userId, dietaId);

    const seguimientos: Array<{
      diaIndex: number;
      comidaIndex: number;
      platoIndex: number;
      seguimiento: SeguimientoPlato;
      fecha: Date;
      nombreComida: string;
      nombrePlato: string;
    }> = [];

    // Recopilar todos los seguimientos
    dieta.dias.forEach((dia: DiaDietaType, diaIdx: number) => {
      dia.comidas.forEach((comida: { nombreComida?: string; platos: Array<{ satisfaccion?: number | null; cumplimiento?: number | null; notaUsuario?: string | null; }> }, comidaIdx: number) => {
        // Aplicar filtros de día y comida
        if (diaIndex !== undefined && diaIdx !== diaIndex) return;
        if (comidaIndex !== undefined && comidaIdx !== comidaIndex) return;

        // Calcular fecha de la comida
        const fechaComida = new Date(dieta.fechaInicio);
        fechaComida.setDate(fechaComida.getDate() + diaIdx);

        // Aplicar filtros de fecha
        if (fechaDesde && fechaComida < fechaDesde) return;
        if (fechaHasta && fechaComida > fechaHasta) return;

        // Recorrer platos de la comida
        comida.platos.forEach((plato: { satisfaccion?: number | null; cumplimiento?: number | null; notaUsuario?: string | null; nombre?: string }, platoIdx: number) => {
          // Aplicar filtros de satisfacción y cumplimiento
          if (satisfaccionMinima !== undefined && (plato.satisfaccion === null || plato.satisfaccion === undefined || plato.satisfaccion < satisfaccionMinima)) return;
          if (cumplimientoMinimo !== undefined && (plato.cumplimiento === null || plato.cumplimiento === undefined || plato.cumplimiento < cumplimientoMinimo)) return;

          // Solo incluir platos que tienen seguimiento
          if (plato.satisfaccion !== null || plato.cumplimiento !== null || plato.notaUsuario) {
            seguimientos.push({
              diaIndex: diaIdx,
              comidaIndex: comidaIdx,
              platoIndex: platoIdx,
              seguimiento: {
                satisfaccion: plato.satisfaccion || undefined,
                cumplimiento: plato.cumplimiento || undefined,
                notaUsuario: plato.notaUsuario || undefined
              },
              fecha: fechaComida,
              nombreComida: comida.nombreComida || `Comida ${comidaIdx + 1}`,
              nombrePlato: plato.nombre || `Plato ${platoIdx + 1}`
            });
          }
        });
      });
    });

    // Ordenar por fecha (más reciente primero)
    seguimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    // Aplicar paginación
    const total = seguimientos.length;
    const seguimientosPaginados = seguimientos.slice(offset, offset + limit);

    logger.info('Seguimiento de platos obtenido', {
      userId,
      dietaId,
      total,
      limit,
      offset,
      resultados: seguimientosPaginados.length
    });

    return {
      seguimientos: seguimientosPaginados.map(item => ({
        ...item.seguimiento,
        diaIndex: item.diaIndex,
        comidaIndex: item.comidaIndex,
        platoIndex: item.platoIndex,
        fecha: item.fecha,
        nombreComida: item.nombreComida,
        nombrePlato: item.nombrePlato
      })),
      total,
      pagina: Math.floor(offset / limit) + 1,
      limite: limit,
      totalPaginas: Math.ceil(total / limit)
    };
  } catch (error) {
    logger.error('Error en obtenerSeguimientoComidasService', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      dietaId
    });
    throw error;
  }
}

/**
 * Obtener estadísticas de seguimiento
 */
export async function obtenerEstadisticasSeguimientoService({
  userId,
  dietaId,
  fechaDesde,
  fechaHasta,
  incluirTendencias
}: ObtenerEstadisticasParams): Promise<EstadisticasSeguimiento> {
  try {
    // Verificar acceso a la dieta
    const dieta = await verificarAccesoDieta(userId, dietaId);

    let totalPlatos = 0;
    let platosConSeguimiento = 0;
    let sumaSatisfaccion = 0;
    const platosFavoritos: { [key: string]: number } = {};
    const platosMenosGustados: { [key: string]: number } = {};
    let platosConsumidos = 0;
    let platosOmitidos = 0;
    let platosParciales = 0;

    // Procesar cada día
    dieta.dias.forEach((dia: DiaDietaType, diaIdx: number) => {
      const fechaComida = new Date(dieta.fechaInicio);
      fechaComida.setDate(fechaComida.getDate() + diaIdx);

      // Aplicar filtros de fecha
      if (fechaDesde && fechaComida < fechaDesde) return;
      if (fechaHasta && fechaComida > fechaHasta) return;

      dia.comidas.forEach((comida: { nombreComida?: string; platos: Array<{ nombre?: string; satisfaccion?: number | null; cumplimiento?: number | null; notaUsuario?: string | null; }> }) => {
        const nombreComida = comida.nombreComida || 'Comida sin nombre';

        // Procesar cada plato de la comida
        comida.platos.forEach((plato: { nombre?: string; satisfaccion?: number | null; cumplimiento?: number | null; notaUsuario?: string | null; }) => {
          totalPlatos++;
          const nombrePlato = plato.nombre || 'Plato sin nombre';
          const nombreCompleto = `${nombreComida} - ${nombrePlato}`;

          // Contar platos con seguimiento
          if (plato.satisfaccion !== null || plato.cumplimiento !== null || plato.notaUsuario) {
            platosConSeguimiento++;

            // Acumular satisfacción y cumplimiento
            if (plato.satisfaccion !== null && plato.satisfaccion !== undefined) {
              sumaSatisfaccion += plato.satisfaccion;
              if (plato.satisfaccion >= 4) {
                platosFavoritos[nombreCompleto] = (platosFavoritos[nombreCompleto] || 0) + 1;
              } else if (plato.satisfaccion <= 2) {
                platosMenosGustados[nombreCompleto] = (platosMenosGustados[nombreCompleto] || 0) + 1;
              }
            }

            if (plato.cumplimiento !== null && plato.cumplimiento !== undefined) {
              if (plato.cumplimiento >= 4) {
                platosConsumidos++;
              } else if (plato.cumplimiento <= 2) {
                platosOmitidos++;
              } else {
                platosParciales++;
              }
            }
          }
        });
      });
    });

    // Calcular promedios
    const satisfaccionPromedio = platosConSeguimiento > 0 ? sumaSatisfaccion / platosConSeguimiento : 0;
    const porcentajeCumplimiento = totalPlatos > 0 ? (platosConsumidos / totalPlatos) * 100 : 0;

    // Obtener platos más/menos gustados
    const platosFavoritosArray = Object.entries(platosFavoritos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nombre]) => nombre);

    const platosMenosGustadosArray = Object.entries(platosMenosGustados)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nombre]) => nombre);

    // Calcular tendencias si se solicita
    let tendenciaSatisfaccion: 'mejorando' | 'empeorando' | 'estable' = 'estable';
    let tendenciaCumplimiento: 'mejorando' | 'empeorando' | 'estable' = 'estable';

    if (incluirTendencias && dieta.dias.length > 1) {
      // Dividir en dos mitades para comparar tendencias
      const mitad = Math.floor(dieta.dias.length / 2);
      let satisfaccionPrimeraMitad = 0;
      let satisfaccionSegundaMitad = 0;
      let cumplimientoPrimeraMitad = 0;
      let cumplimientoSegundaMitad = 0;
      let contadorPrimeraMitad = 0;
      let contadorSegundaMitad = 0;

      dieta.dias.forEach((dia: DiaDietaType, diaIdx: number) => {
        const fechaComida = new Date(dieta.fechaInicio);
        fechaComida.setDate(fechaComida.getDate() + diaIdx);

        if (fechaDesde && fechaComida < fechaDesde) return;
        if (fechaHasta && fechaComida > fechaHasta) return;

        dia.comidas.forEach((comida: { platos: Array<{ satisfaccion?: number | null; cumplimiento?: number | null; }> }) => {
          comida.platos.forEach((plato: { satisfaccion?: number | null; cumplimiento?: number | null; }) => {
            if (diaIdx < mitad) {
              if (plato.satisfaccion !== null && plato.satisfaccion !== undefined) {
                satisfaccionPrimeraMitad += plato.satisfaccion;
                contadorPrimeraMitad++;
              }
              if (plato.cumplimiento !== null && plato.cumplimiento !== undefined) {
                cumplimientoPrimeraMitad += plato.cumplimiento;
              }
            } else {
              if (plato.satisfaccion !== null && plato.satisfaccion !== undefined) {
                satisfaccionSegundaMitad += plato.satisfaccion;
                contadorSegundaMitad++;
              }
              if (plato.cumplimiento !== null && plato.cumplimiento !== undefined) {
                cumplimientoSegundaMitad += plato.cumplimiento;
              }
            }
          });
        });
      });

      const promedioSatisfaccionPrimera = contadorPrimeraMitad > 0 ? satisfaccionPrimeraMitad / contadorPrimeraMitad : 0;
      const promedioSatisfaccionSegunda = contadorSegundaMitad > 0 ? satisfaccionSegundaMitad / contadorSegundaMitad : 0;

      if (promedioSatisfaccionSegunda > promedioSatisfaccionPrimera + 0.5) {
        tendenciaSatisfaccion = 'mejorando';
      } else if (promedioSatisfaccionSegunda < promedioSatisfaccionPrimera - 0.5) {
        tendenciaSatisfaccion = 'empeorando';
      }

      const promedioCumplimientoPrimera = mitad > 0 ? cumplimientoPrimeraMitad / mitad : 0;
      const promedioCumplimientoSegunda = (dieta.dias.length - mitad) > 0 ? cumplimientoSegundaMitad / (dieta.dias.length - mitad) : 0;

      if (promedioCumplimientoSegunda > promedioCumplimientoPrimera + 0.5) {
        tendenciaCumplimiento = 'mejorando';
      } else if (promedioCumplimientoSegunda < promedioCumplimientoPrimera - 0.5) {
        tendenciaCumplimiento = 'empeorando';
      }
    }

    const estadisticas: EstadisticasSeguimiento = {
      satisfaccionPromedio: Math.round(satisfaccionPromedio * 100) / 100,
      porcentajeCumplimiento: Math.round(porcentajeCumplimiento * 100) / 100,
      comidasFavoritas: platosFavoritosArray,
      comidasMenosGustadas: platosMenosGustadosArray,
      ingredientesMasModificados: [], // No implementado en esta versión simplificada
      tendenciaSatisfaccion,
      tendenciaCumplimiento,
      totalComidas: totalPlatos,
      comidasConsumidas: platosConsumidos,
      comidasOmitidas: platosOmitidos,
      comidasParciales: platosParciales
    };

    logger.info('Estadísticas de seguimiento calculadas', {
      userId,
      dietaId,
      satisfaccionPromedio: estadisticas.satisfaccionPromedio,
      porcentajeCumplimiento: estadisticas.porcentajeCumplimiento,
      totalComidas: estadisticas.totalComidas
    });

    return estadisticas;
  } catch (error) {
    logger.error('Error en obtenerEstadisticasSeguimientoService', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      dietaId
    });
    throw error;
  }
}

// Interfaces para los nuevos servicios
interface ObtenerEstadisticasGeneralesParams {
  userId: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

interface ObtenerEstadisticasSemanalParams {
  userId: string;
  numeroSemana: number;
  año: number;
}

interface ObtenerProgresoComidasParams {
  userId: string;
  limite: number;
  offset: number;
  ordenarPor: string;
  orden: string;
}


/**
 * Obtener estadísticas generales de seguimiento nutricional del usuario
 */
export async function obtenerEstadisticasGeneralesService({
  userId
}: ObtenerEstadisticasGeneralesParams): Promise<{
  porcentajeCumplimientoGeneral: number;
  totalComidasRegistradas: number;
  totalComidasPlanificadas: number;
  promedioSatisfaccion: number;
  promedioCumplimiento: number;
  dietasActivas: number;
  totalDietas: number;
}> {
  try {
    // Buscar todas las dietas del usuario
    const dietas = await Dieta.find({
      $or: [
        { asignadaA: userId },
        { creador: userId }
      ]
    });

    let totalPlatosRegistrados = 0;
    let totalPlatosPlanificados = 0;
    let sumaSatisfaccion = 0;
    let sumaCumplimiento = 0;
    let contadorSatisfaccion = 0;
    let contadorCumplimiento = 0;

    // Procesar cada dieta
    for (const dieta of dietas) {
      for (const dia of dieta.dias) {
        for (const comida of dia.comidas) {
          for (const plato of comida.platos) {
            totalPlatosPlanificados++;
            
            // Verificar si tiene seguimiento
            if (plato.satisfaccion !== null && plato.satisfaccion !== undefined) {
              totalPlatosRegistrados++;
              sumaSatisfaccion += plato.satisfaccion;
              contadorSatisfaccion++;
            }
            
            if (plato.cumplimiento !== null && plato.cumplimiento !== undefined) {
              sumaCumplimiento += plato.cumplimiento;
              contadorCumplimiento++;
            }
          }
        }
      }
    }

    const promedioSatisfaccion = contadorSatisfaccion > 0 ? sumaSatisfaccion / contadorSatisfaccion : 0;
    const promedioCumplimiento = contadorCumplimiento > 0 ? sumaCumplimiento / contadorCumplimiento : 0;
    const porcentajeCumplimientoGeneral = totalPlatosPlanificados > 0 ? (totalPlatosRegistrados / totalPlatosPlanificados) * 100 : 0;

    logger.info('Estadísticas generales calculadas', {
      userId,
      totalDietas: dietas.length,
      totalPlatosRegistrados,
      totalPlatosPlanificados,
      promedioSatisfaccion,
      promedioCumplimiento
    });

    return {
      totalDietas: dietas.length,
      dietasActivas: dietas.filter(d => !d.draftMode).length,
      promedioSatisfaccion: Math.round(promedioSatisfaccion * 100) / 100,
      promedioCumplimiento: Math.round(promedioCumplimiento * 100) / 100,
      totalComidasRegistradas: totalPlatosRegistrados,
      totalComidasPlanificadas: totalPlatosPlanificados,
      porcentajeCumplimientoGeneral: Math.round(porcentajeCumplimientoGeneral * 100) / 100
    };
  } catch (error) {
    logger.error('Error en obtenerEstadisticasGeneralesService', {
      error: error instanceof Error ? error.message : String(error),
      userId
    });
    throw error;
  }
}

/**
 * Obtener estadísticas semanales de seguimiento nutricional del usuario
 */
export async function obtenerEstadisticasSemanalService({
  userId,
  numeroSemana,
  año
}: ObtenerEstadisticasSemanalParams): Promise<{
  semana: {
    numero: number;
    año: number;
    fechaInicio: string;
    fechaFin: string;
  };
  progreso: {
    comidasRegistradas: number;
    comidasPlanificadas: number;
    porcentajeCompletitud: number;
    promedioSatisfaccion: number;
    promedioCumplimiento: number;
  };
  asistencia: {
    comidasConsumidas: number;
    comidasOmitidas: number;
    comidasParciales: number;
    porcentajeAsistencia: number;
  };
  tendencias: {
    satisfaccion: string;
    cumplimiento: string;
  };
}> {
  // Calcular las fechas de inicio y fin de la semana
    const fechaInicioSemana = getDateOfISOWeek(numeroSemana, año);
    const fechaFinSemana = new Date(fechaInicioSemana);
    fechaFinSemana.setDate(fechaFinSemana.getDate() + 6);

    logger.info('Fechas calculadas para la semana', {
      userId,
      numeroSemana,
      año,
      fechaInicioSemana: fechaInicioSemana.toISOString(),
      fechaFinSemana: fechaFinSemana.toISOString()
    });

    // Buscar todas las dietas del usuario
    const dietas = await Dieta.find({
      $or: [
        { asignadaA: userId },
        { creador: userId }
      ]
    }).populate('dias.comidas.platos.receta');

    logger.info('Dietas encontradas para el usuario', {
      userId,
      totalDietas: dietas.length,
      dietas: dietas.map(d => ({
        id: d._id,
        nombre: d.nombre,
        fechaInicio: d.fechaInicio,
        dias: d.dias.length,
        asignadaA: d.asignadaA,
        creador: d.creador
      }))
    });

    if (dietas.length === 0) {
      return {
        semana: {
          numero: numeroSemana,
          año: año,
          fechaInicio: fechaInicioSemana.toISOString(),
          fechaFin: fechaFinSemana.toISOString()
        },
        progreso: {
          comidasRegistradas: 0,
          comidasPlanificadas: 0,
          porcentajeCompletitud: 0,
          promedioSatisfaccion: 0,
          promedioCumplimiento: 0
        },
        asistencia: {
          comidasConsumidas: 0,
          comidasOmitidas: 0,
          comidasParciales: 0,
          porcentajeAsistencia: 0
        },
        tendencias: {
          satisfaccion: 'estable',
          cumplimiento: 'estable'
        },
      };
    }

    // Calcular estadísticas de la semana
    let comidasRegistradas = 0;
    let comidasPlanificadas = 0;
    let totalSatisfaccion = 0;
    let totalCumplimiento = 0;
    let contadorSatisfaccion = 0;
    let contadorCumplimiento = 0;
    const distribucionComidas = {
      desayuno: 0,
      almuerzo: 0,
      merienda: 0,
      cena: 0,
      snack: 0
    };
    const comidasConSeguimiento: Array<{ nombre: string; satisfaccion: number; vecesConsumida: number }> = [];

    for (const dieta of dietas) {
      // Verificar si la dieta está activa en la semana especificada
      const fechaInicioDieta = new Date(dieta.fechaInicio);
      const fechaFinDieta = new Date(fechaInicioDieta);
      fechaFinDieta.setDate(fechaFinDieta.getDate() + dieta.dias.length - 1);

      logger.info('Verificando dieta para semana', {
        dietaId: dieta._id,
        dietaNombre: dieta.nombre,
        fechaInicioDieta: fechaInicioDieta.toISOString(),
        fechaFinDieta: fechaFinDieta.toISOString(),
        fechaInicioSemana: fechaInicioSemana.toISOString(),
        fechaFinSemana: fechaFinSemana.toISOString(),
        diasDieta: dieta.dias.length
      });

      // Si la dieta no se superpone con la semana, saltarla
      if (fechaFinDieta < fechaInicioSemana || fechaInicioDieta > fechaFinSemana) {
        logger.info('Dieta fuera del rango de la semana', { dietaId: dieta._id });
        continue;
      }

      // Calcular qué días de la dieta corresponden a la semana
      const diasEnSemana = [];
      for (let i = 0; i < dieta.dias.length; i++) {
        const fechaDia = new Date(fechaInicioDieta);
        fechaDia.setDate(fechaDia.getDate() + i);
        
        if (fechaDia >= fechaInicioSemana && fechaDia <= fechaFinSemana) {
          diasEnSemana.push({ diaIndex: i, fecha: fechaDia });
        }
      }

      logger.info('Días de la dieta en la semana', {
        dietaId: dieta._id,
        diasEnSemana: diasEnSemana.length,
        dias: diasEnSemana.map(d => ({ diaIndex: d.diaIndex, fecha: d.fecha.toISOString() }))
      });

      // Procesar cada día de la semana
      for (const { diaIndex } of diasEnSemana) {
        const dia = dieta.dias[diaIndex];
        if (!dia || !dia.comidas) continue;

        for (const comida of dia.comidas) {
          if (!comida.platos) continue;

          for (const plato of comida.platos) {
            // Contar como comida planificada
            comidasPlanificadas++;

            // Verificar si tiene seguimiento
            if (plato.satisfaccion !== null || plato.cumplimiento !== null || plato.notaUsuario) {
              comidasRegistradas++;
              
              logger.debug('Plato con seguimiento encontrado', {
                dietaId: dieta._id,
                diaIndex,
                comidaNombre: comida.nombreComida,
                platoNombre: plato.nombre,
                satisfaccion: plato.satisfaccion,
                cumplimiento: plato.cumplimiento,
                tieneNota: !!plato.notaUsuario
              });

              // Acumular satisfacción
              if (plato.satisfaccion !== null) {
                totalSatisfaccion += plato.satisfaccion;
                contadorSatisfaccion++;
              }

              // Acumular cumplimiento
              if (plato.cumplimiento !== null) {
                totalCumplimiento += plato.cumplimiento;
                contadorCumplimiento++;
              }

              // Contar distribución por tipo de comida
              const nombreComida = comida.nombreComida || 'Comida';
              if (nombreComida.toLowerCase().includes('desayuno')) {
                distribucionComidas.desayuno++;
              } else if (nombreComida.toLowerCase().includes('almuerzo')) {
                distribucionComidas.almuerzo++;
              } else if (nombreComida.toLowerCase().includes('merienda')) {
                distribucionComidas.merienda++;
              } else if (nombreComida.toLowerCase().includes('cena')) {
                distribucionComidas.cena++;
              } else {
                distribucionComidas.snack++;
              }

              // Agregar a comidas con seguimiento
              const nombrePlato = plato.nombre || 'Plato sin nombre';
              const comidaExistente = comidasConSeguimiento.find(c => c.nombre === nombrePlato);
              if (comidaExistente) {
                comidaExistente.vecesConsumida++;
                if (plato.satisfaccion !== null) {
                  comidaExistente.satisfaccion = (comidaExistente.satisfaccion + plato.satisfaccion) / 2;
                }
              } else {
                comidasConSeguimiento.push({
                  nombre: nombrePlato,
                  satisfaccion: plato.satisfaccion || 0,
                  vecesConsumida: 1
                });
              }
            }
          }
        }
      }
    }

    // Calcular promedios
    const promedioSatisfaccion = contadorSatisfaccion > 0 ? totalSatisfaccion / contadorSatisfaccion : 0;
    const promedioCumplimiento = contadorCumplimiento > 0 ? totalCumplimiento / contadorCumplimiento : 0;
    const porcentajeCumplimiento = comidasPlanificadas > 0 ? (comidasRegistradas / comidasPlanificadas) * 100 : 0;

    logger.info('Cálculo de estadísticas semanales', {
      userId,
      numeroSemana,
      año,
      comidasPlanificadas,
      comidasRegistradas,
      porcentajeCumplimiento,
      promedioSatisfaccion,
      promedioCumplimiento,
      contadorSatisfaccion,
      contadorCumplimiento,
      totalDietas: dietas.length,
      distribucionComidas,
      comidasConSeguimiento: comidasConSeguimiento.length
    });


    // Determinar tendencias (simplificado - en una implementación real se compararía con semanas anteriores)
    const tendencias = {
      satisfaccion: promedioSatisfaccion >= 4 ? 'mejorando' : promedioSatisfaccion >= 3 ? 'estable' : 'empeorando',
      cumplimiento: porcentajeCumplimiento >= 80 ? 'mejorando' : porcentajeCumplimiento >= 60 ? 'estable' : 'empeorando'
    };

    return {
      semana: {
        numero: numeroSemana,
        año: año,
        fechaInicio: fechaInicioSemana.toISOString(),
        fechaFin: fechaFinSemana.toISOString()
      },
      progreso: {
        comidasRegistradas,
        comidasPlanificadas,
        porcentajeCompletitud: Math.round(porcentajeCumplimiento * 100) / 100,
        promedioSatisfaccion: Math.round(promedioSatisfaccion * 100) / 100,
        promedioCumplimiento: Math.round(promedioCumplimiento * 100) / 100
      },
      asistencia: {
        comidasConsumidas: 0,
        comidasOmitidas: 0,
        comidasParciales: 0,
        porcentajeAsistencia: 0
      },
      tendencias
    };
}

// Función auxiliar para obtener la fecha de inicio de una semana ISO
function getDateOfISOWeek(week: number, year: number): Date {
  // Implementación simple y robusta
  const jan4 = new Date(year, 0, 4); // 4 de enero siempre está en la semana 1
  const jan4Day = jan4.getDay(); // 0 = domingo, 1 = lunes, etc.
  const daysToMonday = jan4Day === 0 ? -6 : 1 - jan4Day; // Ajustar al lunes
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() + daysToMonday);
  
  // Calcular el inicio de la semana solicitada
  const weekStart = new Date(week1Start);
  weekStart.setDate(week1Start.getDate() + (week - 1) * 7);
  
  return weekStart;
}

/**
 * Obtener progreso de comidas específicas del usuario
 */
export async function obtenerProgresoComidasService({
  userId,
  limite,
  offset,
  ordenarPor,
  orden
}: ObtenerProgresoComidasParams): Promise<{
  comidas: Array<{
    nombre: string;
    satisfaccionPromedio: number;
    cumplimientoPromedio: number;
    vecesConsumida: number;
    ultimaConsumida: string | null;
  }>;
  total: number;
  pagina: number;
  totalPaginas: number;
}> {
  try {
    // Buscar todas las dietas del usuario
    const dietas = await Dieta.find({
      $or: [
        { asignadaA: userId },
        { creador: userId }
      ]
    });

    logger.info('Obteniendo progreso de comidas', {
      userId,
      totalDietas: dietas.length,
      dietas: dietas.map(d => ({
        id: d._id,
        nombre: d.nombre,
        dias: d.dias.length
      }))
    });

    const platosConSeguimiento: Array<{
      nombre: string;
      estadisticas: {
        satisfaccionPromedio: number;
        cumplimientoPromedio: number;
        vecesConsumida: number;
        ultimaConsumida: string | null;
      };
    }> = [];

    // Procesar cada dieta
    for (const dieta of dietas) {
      for (let diaIndex = 0; diaIndex < dieta.dias.length; diaIndex++) {
        const dia = dieta.dias[diaIndex];
        for (let comidaIndex = 0; comidaIndex < dia.comidas.length; comidaIndex++) {
          const comida = dia.comidas[comidaIndex];
          for (let platoIndex = 0; platoIndex < comida.platos.length; platoIndex++) {
            const plato = comida.platos[platoIndex];
            
            // Solo incluir platos con seguimiento
            if (plato.satisfaccion !== null || plato.cumplimiento !== null || plato.notaUsuario) {
              const nombrePlato = plato.nombre || `Plato ${platoIndex + 1}`;
              
              // Buscar si ya existe este plato en el array
              let platoExistente = platosConSeguimiento.find(p => p.nombre === nombrePlato);
              
              if (!platoExistente) {
                platoExistente = {
                  nombre: nombrePlato,
                  estadisticas: {
                    satisfaccionPromedio: 0,
                    cumplimientoPromedio: 0,
                    vecesConsumida: 0,
                    ultimaConsumida: null
                  }
                };
                platosConSeguimiento.push(platoExistente);
              }
              
              // Actualizar estadísticas
              platoExistente.estadisticas.vecesConsumida++;
              
              if (plato.satisfaccion !== null && plato.satisfaccion !== undefined) {
                const satisfaccionAnterior = platoExistente.estadisticas.satisfaccionPromedio;
                const totalRegistros = platoExistente.estadisticas.vecesConsumida;
                platoExistente.estadisticas.satisfaccionPromedio = 
                  ((satisfaccionAnterior * (totalRegistros - 1)) + plato.satisfaccion) / totalRegistros;
              }
              
              if (plato.cumplimiento !== null && plato.cumplimiento !== undefined) {
                const cumplimientoAnterior = platoExistente.estadisticas.cumplimientoPromedio;
                const totalRegistros = platoExistente.estadisticas.vecesConsumida;
                platoExistente.estadisticas.cumplimientoPromedio = 
                  ((cumplimientoAnterior * (totalRegistros - 1)) + plato.cumplimiento) / totalRegistros;
              }
              
              // Actualizar última consumida
              const fechaComida = new Date(dieta.fechaInicio);
              fechaComida.setDate(fechaComida.getDate() + diaIndex);
              if (!platoExistente.estadisticas.ultimaConsumida || fechaComida > new Date(platoExistente.estadisticas.ultimaConsumida)) {
                platoExistente.estadisticas.ultimaConsumida = fechaComida.toISOString();
              }
            }
          }
        }
      }
    }

    // Ordenar según el parámetro
    platosConSeguimiento.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case 'satisfaccion':
          valorA = a.estadisticas.satisfaccionPromedio;
          valorB = b.estadisticas.satisfaccionPromedio;
          break;
        case 'cumplimiento':
          valorA = a.estadisticas.cumplimientoPromedio;
          valorB = b.estadisticas.cumplimientoPromedio;
          break;
        case 'fecha':
          valorA = new Date(a.estadisticas.ultimaConsumida || '1970-01-01').getTime();
          valorB = new Date(b.estadisticas.ultimaConsumida || '1970-01-01').getTime();
          break;
        default:
          valorA = a.estadisticas.satisfaccionPromedio;
          valorB = b.estadisticas.satisfaccionPromedio;
      }
      
      if (orden === 'asc') {
        return valorA - valorB;
      } else {
        return valorB - valorA;
      }
    });

    // Aplicar paginación
    const resultado = platosConSeguimiento.slice(offset, offset + limite).map(plato => ({
      nombre: plato.nombre,
      satisfaccionPromedio: plato.estadisticas.satisfaccionPromedio,
      cumplimientoPromedio: plato.estadisticas.cumplimientoPromedio,
      vecesConsumida: plato.estadisticas.vecesConsumida,
      ultimaConsumida: plato.estadisticas.ultimaConsumida
    }));

    logger.info('Progreso de platos calculado', {
      userId,
      totalPlatos: platosConSeguimiento.length,
      resultado: resultado.length
    });

    return {
      comidas: resultado,
      total: platosConSeguimiento.length,
      pagina: Math.floor(offset / limite) + 1,
      totalPaginas: Math.ceil(platosConSeguimiento.length / limite)
    };
  } catch (error) {
    logger.error('Error en obtenerProgresoComidasService', {
      error: error instanceof Error ? error.message : String(error),
      userId
    });
    throw error;
  }
}

/**
 * Obtener rachas nutricionales del usuario
 */
export async function obtenerRachasNutricionalesService(/* params: ObtenerRachasNutricionalesParams */): Promise<{
  rachaActual: {
    dias: number;
    semanas: number;
  };
  rachaMaxima: {
    dias: number;
    semanas: number;
  };
  ultimaComida: string;
  diasSinRegistrar: number;
}> {
  // Por ahora, devolver datos mock hasta implementar la lógica completa
  return {
    rachaActual: {
      dias: 5,
      semanas: 1
    },
    rachaMaxima: {
      dias: 12,
      semanas: 2
    },
    ultimaComida: new Date().toISOString(),
    diasSinRegistrar: 2
  };
}
