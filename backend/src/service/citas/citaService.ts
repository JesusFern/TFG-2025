import Cita from '../../models/citas/cita';
import User from '../../models/users/user';
import { 
  ICita, 
  CrearCitaData, 
  ActualizarCitaData, 
  FiltrosCitas, 
  DisponibilidadProfesional,
  ReagendarCitaData,
  EstadisticasCitas
} from '../../models/citas';
import { crearNotificacionService } from '../chats/notificacionService';
import { socketServer } from '../../server';
import { recordatorioService } from '../notificaciones/recordatorioService';
import mongoose from 'mongoose';
import logger from '../../utils/logger';

// Crear una nueva cita
export async function crearCitaService(datos: CrearCitaData): Promise<ICita> {
  try {
    // Verificar que el cliente y profesional existen
    const [cliente, profesional] = await Promise.all([
      User.findById(datos.cliente),
      User.findById(datos.profesional)
    ]);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    if (!profesional) {
      throw new Error('Profesional no encontrado');
    }

    // Verificar que el profesional es un worker
    if (profesional.role !== 'worker') {
      throw new Error('El usuario seleccionado no es un profesional');
    }


    // Crear la cita
    const cita = new Cita({
      ...datos,
      fecha: new Date(datos.fecha),
      duracion: datos.duracion || 60
    });

    await cita.save();
    await cita.populate(['cliente', 'profesional']);

    // Enviar notificación al profesional
    try {
      const fechaFormateada = new Date(datos.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Crear notificación de solicitud de cita
      const notificacionData = {
        usuario: datos.profesional,
        tipo: 'sistema' as const,
        titulo: 'Nueva solicitud de cita',
        contenido: `${cliente.fullName} ha solicitado una cita para el ${fechaFormateada}. Revisa y confirma la cita.`,
        prioridad: 'alta' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/citas',
          metadata: { citaId: (cita._id as mongoose.Types.ObjectId).toString() }
        },
        metadata: {
          remitente: datos.cliente
        }
      };

      await crearNotificacionService(notificacionData);

      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(datos.profesional, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Notificación de solicitud de cita enviada en tiempo real a ${datos.profesional}`);
      }
    } catch (error) {
      console.error('Error al enviar notificación de solicitud de cita:', error);
      // No lanzar error para no interrumpir el proceso de creación
    }


    logger.info('Cita creada correctamente', { 
      citaId: cita._id, 
      cliente: datos.cliente, 
      profesional: datos.profesional 
    });

    return cita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al crear cita', { 
      error: error instanceof Error ? error.message : String(error),
      datos 
    });
    throw error;
  }
}

// Obtener citas con filtros
export async function obtenerCitasService(filtros: FiltrosCitas): Promise<{
  citas: ICita[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const query: Record<string, unknown> = {};

    if (filtros.cliente) {
      query.cliente = new mongoose.Types.ObjectId(filtros.cliente);
    }

    if (filtros.profesional) {
      query.profesional = new mongoose.Types.ObjectId(filtros.profesional);
    }

    if (filtros.tipo) {
      query.tipo = filtros.tipo;
    }

    if (filtros.estado) {
      query.estado = filtros.estado;
    }


    if (filtros.fechaDesde || filtros.fechaHasta) {
      query.fecha = {} as Record<string, Date>;
      if (filtros.fechaDesde) {
        (query.fecha as Record<string, Date>).$gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        (query.fecha as Record<string, Date>).$lte = filtros.fechaHasta;
      }
    }

    const limit = filtros.limit || 20;
    const offset = filtros.offset || 0;

    const [citas, total] = await Promise.all([
      Cita.find(query)
        .populate('cliente', 'fullName email phoneNumber')
        .populate('profesional', 'fullName email phoneNumber workerType')
        .sort({ fecha: 1, hora: 1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      Cita.countDocuments(query)
    ]);

    return {
      citas: citas as unknown as ICita[],
      total,
      limit,
      offset
    };
  } catch (error) {
    logger.error('Error al obtener citas', { 
      error: error instanceof Error ? error.message : String(error),
      filtros 
    });
    throw error;
  }
}

// Obtener una cita por ID
export async function obtenerCitaPorIdService(citaId: string): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId)
      .populate('cliente', 'fullName email phoneNumber')
      .populate('profesional', 'fullName email phoneNumber workerType')
      .lean();

    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    return cita as unknown as ICita;
  } catch (error) {
    logger.error('Error al obtener cita por ID', { 
      error: error instanceof Error ? error.message : String(error),
      citaId 
    });
    throw error;
  }
}

// Actualizar una cita
export async function actualizarCitaService(
  citaId: string, 
  datos: ActualizarCitaData
): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Verificar que la cita puede ser editada (solo citas pendientes)
    if (cita.estado !== 'pendiente') {
      throw new Error('Solo se pueden editar citas en estado pendiente');
    }

    // Actualizar campos (siempre establecer estado como pendiente al editar)
    Object.assign(cita, datos);
    cita.estado = 'pendiente';
    
    if (datos.fecha) {
      cita.fecha = new Date(datos.fecha);
    }

    await cita.save();
    await cita.populate(['cliente', 'profesional']);

    logger.info('Cita actualizada correctamente', { citaId });

    return cita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al actualizar cita', { 
      error: error instanceof Error ? error.message : String(error),
      citaId,
      datos 
    });
    throw error;
  }
}

// Cancelar una cita
export async function cancelarCitaService(
  citaId: string, 
  motivo: string, 
  usuarioId: string
): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Verificar permisos
    if (cita.cliente.toString() !== usuarioId && cita.profesional.toString() !== usuarioId) {
      throw new Error('No tienes permisos para cancelar esta cita');
    }

    // Verificar que la cita puede ser cancelada
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    const ahora = new Date();
    
    if (fechaCita < ahora || ['completada', 'cancelada'].includes(cita.estado)) {
      throw new Error('Esta cita no puede ser cancelada');
    }

    cita.estado = 'cancelada';
    cita.motivoCancelacion = motivo;
    await cita.save();
    await cita.populate(['cliente', 'profesional']);

    logger.info('Cita cancelada correctamente', { citaId, motivo });

    return cita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al cancelar cita', { 
      error: error instanceof Error ? error.message : String(error),
      citaId,
      motivo 
    });
    throw error;
  }
}

// Reagendar una cita
export async function reagendarCitaService(
  citaId: string, 
  datos: ReagendarCitaData, 
  usuarioId: string
): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Verificar permisos
    if (cita.cliente.toString() !== usuarioId && cita.profesional.toString() !== usuarioId) {
      throw new Error('No tienes permisos para reagendar esta cita');
    }

    // Verificar que la cita puede ser reagendada
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    const ahora = new Date();
    
    if (fechaCita < ahora || ['completada', 'cancelada', 'reagendada'].includes(cita.estado)) {
      throw new Error('Esta cita no puede ser reagendada');
    }

    // Crear nueva cita reagendada
    const nuevaCita = new Cita({
      cliente: cita.cliente,
      profesional: cita.profesional,
      tipo: cita.tipo,
      fecha: new Date(datos.nuevaFecha),
      hora: datos.nuevaHora,
      duracion: cita.duracion,
      motivo: cita.motivo,
      reagendadaDesde: cita._id
    });

    await nuevaCita.save();

    // Marcar cita original como reagendada
    cita.estado = 'reagendada';
    cita.motivoCancelacion = datos.motivo || 'Reagendada';
    await cita.save();

    await nuevaCita.populate(['cliente', 'profesional']);

    logger.info('Cita reagendada correctamente', { 
      citaOriginal: citaId, 
      nuevaCita: nuevaCita._id 
    });

    return nuevaCita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al reagendar cita', { 
      error: error instanceof Error ? error.message : String(error),
      citaId,
      datos 
    });
    throw error;
  }
}

// Confirmar una cita
export async function confirmarCitaService(citaId: string, usuarioId: string): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Solo el profesional puede confirmar
    if (cita.profesional.toString() !== usuarioId) {
      throw new Error('Solo el profesional puede confirmar la cita');
    }

    if (cita.estado !== 'pendiente') {
      throw new Error('Solo se pueden confirmar citas pendientes');
    }

    cita.estado = 'confirmada';
    await cita.save();
    await cita.populate(['cliente', 'profesional']);

    // Enviar notificación al cliente
    try {
      logger.info('=== INICIANDO ENVÍO DE NOTIFICACIÓN DE CITA CONFIRMADA ===');
      logger.info('Cliente ID:', cita.cliente.toString());
      logger.info('Profesional ID:', cita.profesional.toString());
      
      const fechaFormateada = cita.fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const profesional = cita.profesional as { fullName?: string };
      logger.info('Profesional nombre:', profesional.fullName);
      
      // Crear notificación de cita confirmada
      const notificacionData = {
        usuario: cita.cliente._id,
        tipo: 'sistema' as const,
        titulo: 'Cita confirmada',
        contenido: `${profesional.fullName || 'Profesional'} ha confirmado tu cita para el ${fechaFormateada}. ¡Nos vemos pronto!`,
        prioridad: 'normal' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/citas',
          metadata: { citaId }
        },
        metadata: {
          remitente: cita.profesional
        }
      };

      logger.info('Datos de notificación:', JSON.stringify(notificacionData, null, 2));
      
      logger.info('Creando notificación en base de datos...');
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      logger.info('Notificación creada en base de datos exitosamente con ID:', notificacionGuardada._id);

      // Enviar notificación en tiempo real
      if (socketServer) {
        logger.info('Enviando notificación en tiempo real...');
        logger.info('Cliente ID para envío:', cita.cliente.toString());
        logger.info('Notificación guardada:', JSON.stringify(notificacionGuardada, null, 2));
        
        try {
          await socketServer.sendNotificationToUser(cita.cliente.toString(), notificacionGuardada as unknown as Record<string, unknown>);
          logger.info(`Notificación de cita confirmada enviada en tiempo real a ${cita.cliente}`);
        } catch (socketError) {
          logger.error('Error al enviar via WebSocket:', socketError);
        }
      } else {
        logger.error('socketServer no está disponible');
      }
    } catch (error) {
      logger.error('Error al enviar notificación de cita confirmada:', error);
      console.error('Error al enviar notificación de cita confirmada:', error);
      // No lanzar error para no interrumpir el proceso de confirmación
    }

    // Crear recordatorio automático para la cita confirmada (1 hora antes)
    try {
      const fechaHoraCita = new Date(cita.fecha);
      if (cita.hora) {
        const [horas, minutos] = cita.hora.split(':').map(Number);
        fechaHoraCita.setHours(horas, minutos, 0, 0);
      }
      
      const profesional = cita.profesional as { fullName?: string };
      await recordatorioService.crearRecordatorioCita(
        cita.cliente.toString(),
        cita.profesional.toString(),
        citaId,
        `Cita con ${profesional.fullName || 'Profesional'}`,
        fechaHoraCita
      );
      
      logger.info(`Recordatorio de cita creado para ${cita.cliente} en ${fechaHoraCita.toISOString()}`);
    } catch (error) {
      logger.error('Error al crear recordatorio de cita:', error);
      // No lanzar error para no interrumpir la confirmación de la cita
    }

    logger.info('Cita confirmada correctamente', { citaId });

    return cita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al confirmar cita', { 
      error: error instanceof Error ? error.message : String(error),
      citaId 
    });
    throw error;
  }
}

// Completar una cita
export async function completarCitaService(
  citaId: string, 
  usuarioId: string
): Promise<ICita> {
  try {
    const cita = await Cita.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Solo el profesional puede completar
    if (cita.profesional.toString() !== usuarioId) {
      throw new Error('Solo el profesional puede completar la cita');
    }

    if (!['confirmada', 'en_progreso'].includes(cita.estado)) {
      throw new Error('Solo se pueden completar citas confirmadas o en progreso');
    }

    cita.estado = 'completada';
    await cita.save();
    await cita.populate(['cliente', 'profesional']);

    logger.info('Cita completada correctamente', { citaId });

    return cita.toObject() as unknown as ICita;
  } catch (error) {
    logger.error('Error al completar cita', { 
      error: error instanceof Error ? error.message : String(error),
      citaId 
    });
    throw error;
  }
}


// Obtener disponibilidad de un profesional
export async function obtenerDisponibilidadProfesionalService(
  profesionalId: string, 
  fecha: string
): Promise<DisponibilidadProfesional> {
  try {
    const profesional = await User.findById(profesionalId);
    if (!profesional || profesional.role !== 'worker') {
      throw new Error('Profesional no encontrado');
    }

    const fechaConsulta = new Date(fecha);
    const fechaInicio = new Date(fechaConsulta);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fechaConsulta);
    fechaFin.setHours(23, 59, 59, 999);

    // Obtener citas existentes para esa fecha
    const citasExistentes = await Cita.find({
      profesional: new mongoose.Types.ObjectId(profesionalId),
      fecha: {
        $gte: fechaInicio,
        $lte: fechaFin
      },
      estado: { $in: ['confirmada', 'en_progreso'] }
    }).lean();

    // Generar horarios disponibles (simplificado - en producción se usaría la disponibilidad del worker)
    const horariosDisponibles = generarHorariosDisponibles(citasExistentes);

    return {
      profesionalId,
      disponibilidad: profesional.availability || 'Lunes a Viernes 9:00-18:00',
      citasExistentes: citasExistentes as unknown as ICita[],
      horariosDisponibles
    };
  } catch (error) {
    logger.error('Error al obtener disponibilidad del profesional', { 
      error: error instanceof Error ? error.message : String(error),
      profesionalId,
      fecha 
    });
    throw error;
  }
}

// Obtener estadísticas de citas
export async function obtenerEstadisticasCitasService(
  usuarioId: string, 
  esProfesional: boolean = false
): Promise<EstadisticasCitas> {
  try {
    const filtro = esProfesional 
      ? { profesional: new mongoose.Types.ObjectId(usuarioId) }
      : { cliente: new mongoose.Types.ObjectId(usuarioId) };

    const citas = await Cita.find(filtro).lean();

    const estadisticas: EstadisticasCitas = {
      totalCitas: citas.length,
      citasPendientes: citas.filter(c => c.estado === 'pendiente').length,
      citasConfirmadas: citas.filter(c => c.estado === 'confirmada').length,
      citasCompletadas: citas.filter(c => c.estado === 'completada').length,
      citasCanceladas: citas.filter(c => c.estado === 'cancelada').length,
      citasPorTipo: {},
      citasPorMes: []
    };

    // Contar citas por tipo
    citas.forEach(cita => {
      estadisticas.citasPorTipo[cita.tipo] = (estadisticas.citasPorTipo[cita.tipo] || 0) + 1;
    });

    // Contar citas por mes (últimos 12 meses)
    const ahora = new Date();
    for (let i = 0; i < 12; i++) {
      const mes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesSiguiente = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 1);
      
      const cantidad = citas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita >= mes && fechaCita < mesSiguiente;
      }).length;

      estadisticas.citasPorMes.unshift({
        mes: mes.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        cantidad
      });
    }

    return estadisticas;
  } catch (error) {
    logger.error('Error al obtener estadísticas de citas', { 
      error: error instanceof Error ? error.message : String(error),
      usuarioId 
    });
    throw error;
  }
}

// Función auxiliar para generar horarios disponibles
function generarHorariosDisponibles(citasExistentes: unknown[]): string[] {
  const horariosOcupados = citasExistentes.map((cita: unknown) => (cita as { hora: string }).hora);
  const horariosDisponibles: string[] = [];
  
  // Generar horarios de 9:00 a 18:00 cada 30 minutos
  for (let hora = 9; hora < 18; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      if (!horariosOcupados.includes(horario)) {
        horariosDisponibles.push(horario);
      }
    }
  }
  
  return horariosDisponibles;
}
