import Notificacion from '../../models/chats/notificacion';
import { INotificacion } from '../../models/chats';
import mongoose from 'mongoose';

export interface CrearNotificacionData {
  usuario: string | mongoose.Types.ObjectId;
  tipo: 'mensaje' | 'recordatorio' | 'sistema' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  accion?: {
    tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';
    url?: string;
    metadata?: Record<string, string | number | boolean>;
  };
  metadata?: {
    mensaje?: string | mongoose.Types.ObjectId;
    conversacion?: string | mongoose.Types.ObjectId;
    planEntrenamiento?: string | mongoose.Types.ObjectId;
    dieta?: string | mongoose.Types.ObjectId;
    sesion?: string | mongoose.Types.ObjectId;
    remitente?: string | mongoose.Types.ObjectId;
  };
  programadaPara?: Date;
  expiraEn?: Date;
}

export interface FiltrosNotificaciones {
  usuario?: string;
  tipo?: string;
  leida?: boolean;
  prioridad?: string;
  limit?: number;
  offset?: number;
}

export async function crearNotificacionService(datos: CrearNotificacionData): Promise<INotificacion> {
  try {
    const notificacion = new Notificacion({
      ...datos,
      leida: false,
      enviada: false
    });

    const notificacionGuardada = await notificacion.save();
    
    return notificacionGuardada.toObject() as unknown as INotificacion;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
    throw new Error('Error desconocido al crear notificación');
  }
}

// Función helper para construir consultas de forma segura
function buildSafeNotificationQuery(
  usuarioId: string,
  tipo?: string,
  prioridad?: string,
  leida?: boolean
): Record<string, unknown> {
  const tiposValidos = ['mensaje', 'recordatorio', 'sistema', 'entrenamiento', 'nutricion'];
  const prioridadesValidas = ['baja', 'normal', 'alta', 'urgente'];

  // Construir consulta base segura
  const baseQuery = {
    usuario: new mongoose.Types.ObjectId(usuarioId),
    $or: [
      { enviada: true },
      { programadaPara: { $lte: new Date() } },
      { programadaPara: { $exists: false } }
    ]
  };

  // Agregar filtros solo si son válidos y seguros
  const query: Record<string, unknown> = { ...baseQuery };

  if (tipo && tiposValidos.includes(tipo)) {
    query.tipo = tipo;
  }

  if (prioridad && prioridadesValidas.includes(prioridad)) {
    query.prioridad = prioridad;
  }

  if (leida !== undefined) {
    query.leida = leida;
  }

  return query;
}

export async function obtenerNotificacionesService(
  usuarioId: string,
  filtros: {
    limit?: number;
    offset?: number;
    tipo?: string;
    prioridad?: string;
    leida?: boolean;
    orden?: 'asc' | 'desc';
  }
): Promise<{
  notificaciones: Record<string, unknown>[];
  total: number;
  paginacion: {
    pagina: number;
    totalPaginas: number;
    limite: number;
    offset: number;
  };
}> {
  try {
    const {
      limit = 20,
      offset = 0,
      tipo,
      prioridad,
      leida,
      orden = 'desc'
    } = filtros;

    // Validar límites de paginación
    const limitValidado = Math.min(Math.max(parseInt(limit.toString()) || 20, 1), 100);
    const offsetValidado = Math.max(parseInt(offset.toString()) || 0, 0);
    const ordenesValidos = ['asc', 'desc'];
    const ordenValidado = ordenesValidos.includes(orden) ? orden : 'desc';

    // Construir consulta de forma segura
    const safeQuery = buildSafeNotificationQuery(usuarioId, tipo, prioridad, leida);

    // Obtener total de notificaciones
    const total = await Notificacion.countDocuments(safeQuery);

    // Obtener notificaciones con paginación
    const notificaciones = await Notificacion.find(safeQuery)
      .sort({ createdAt: ordenValidado === 'asc' ? 1 : -1 })
      .skip(offsetValidado)
      .limit(limitValidado)
      .lean();

    const totalPaginas = Math.ceil(total / limitValidado);
    const pagina = Math.floor(offsetValidado / limitValidado) + 1;

    return {
      notificaciones: notificaciones as unknown as Record<string, unknown>[],
      total,
      paginacion: {
        pagina,
        totalPaginas,
        limite: limitValidado,
        offset: offsetValidado
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificaciones');
  }
}

export async function obtenerNotificacionPorIdService(
  notificacionId: string,
  usuarioId: string
): Promise<Record<string, unknown>> {
  try {
    // Validar que el ID sea un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(notificacionId)) {
      throw new Error('ID de notificación inválido');
    }

    const notificacion = await Notificacion.findOne({
      _id: new mongoose.Types.ObjectId(notificacionId),
      usuario: new mongoose.Types.ObjectId(usuarioId)
    }).lean();

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    return notificacion as unknown as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificación: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificación');
  }
}

export async function marcarComoLeidaService(
  notificacionId: string,
  usuarioId: string
): Promise<void> {
  try {
    // Validar que los IDs sean ObjectIds válidos de MongoDB
    if (!mongoose.Types.ObjectId.isValid(notificacionId)) {
      throw new Error('ID de notificación inválido');
    }
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      throw new Error('ID de usuario inválido');
    }

    const notificacion = await Notificacion.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(notificacionId), 
        usuario: new mongoose.Types.ObjectId(usuarioId) 
      },
      { leida: true },
      { new: true }
    );

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar notificación como leída: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar notificación como leída');
  }
}

export async function marcarTodasComoLeidasService(
  usuarioId: string
): Promise<{ actualizadas: number }> {
  try {
    const resultado = await Notificacion.updateMany(
      { usuario: usuarioId, leida: false },
      { leida: true }
    );

    return { actualizadas: resultado.modifiedCount };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar todas las notificaciones como leídas');
  }
}

export async function eliminarNotificacionService(
  notificacionId: string,
  usuarioId: string
): Promise<void> {
  try {
    // Validar que los IDs sean ObjectIds válidos de MongoDB
    if (!mongoose.Types.ObjectId.isValid(notificacionId)) {
      throw new Error('ID de notificación inválido');
    }
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      throw new Error('ID de usuario inválido');
    }

    const notificacion = await Notificacion.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(notificacionId),
      usuario: new mongoose.Types.ObjectId(usuarioId)
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar notificación: ${error.message}`);
    }
    throw new Error('Error desconocido al eliminar notificación');
  }
}

export async function obtenerNotificacionesNoLeidasService(usuarioId: string): Promise<INotificacion[]> {
  try {
    const notificaciones = await Notificacion.find({
      usuario: usuarioId,
      leida: false
    }).sort({ createdAt: -1 }).lean();
    
    return notificaciones as unknown as INotificacion[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificaciones no leídas: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificaciones no leídas');
  }
}

export async function contarNotificacionesNoLeidasService(usuarioId: string): Promise<number> {
  try {
    return await Notificacion.countDocuments({
      usuario: usuarioId,
      leida: false
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al contar notificaciones no leídas: ${error.message}`);
    }
    throw new Error('Error desconocido al contar notificaciones no leídas');
  }
}

export async function enviarNotificacionesProgramadasService(): Promise<void> {
  try {
    const ahora = new Date();
    
    // Buscar notificaciones programadas para enviar
    const notificacionesProgramadas = await Notificacion.find({
      programadaPara: { $lte: ahora },
      enviada: false
    });

    for (const notificacion of notificacionesProgramadas) {
      notificacion.enviada = true;
      await notificacion.save();
      
      // Aquí se implementaría la lógica para enviar la notificación
      // (email, push notification, etc.)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al enviar notificaciones programadas: ${error.message}`);
    }
    throw new Error('Error desconocido al enviar notificaciones programadas');
  }
}

export async function limpiarNotificacionesExpiradasService(): Promise<void> {
  try {
    const ahora = new Date();
    
    // Eliminar notificaciones expiradas
    await Notificacion.deleteMany({
      expiraEn: { $lt: ahora }
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al limpiar notificaciones expiradas: ${error.message}`);
    }
    throw new Error('Error desconocido al limpiar notificaciones expiradas');
  }
}

// ===== FUNCIONES ESPECÍFICAS DEL SISTEMA =====

// Notificación de mensaje en chat
export async function notificarMensajeChatService(
  destinatarioId: string, 
  remitenteId: string, 
  remitenteNombre: string, 
  mensajeId: string,
  conversacionId: string,
  contenido: string
): Promise<void> {
  try {
    const notificacion: CrearNotificacionData = {
      usuario: destinatarioId,
      tipo: 'mensaje',
      titulo: `Nuevo mensaje de ${remitenteNombre}`,
      contenido: contenido.length > 100 ? `${contenido.substring(0, 100)}...` : contenido,
      prioridad: 'normal',
      accion: {
        tipo: 'abrir_conversacion',
        metadata: { conversacionId, mensajeId }
      },
      metadata: {
        mensaje: mensajeId,
        conversacion: conversacionId,
        remitente: remitenteId
      }
    };

    await crearNotificacionService(notificacion);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear notificación de mensaje: ${error.message}`);
    }
    throw new Error('Error desconocido al crear notificación de mensaje');
  }
}

// ===== NOTIFICACIONES PROGRAMADAS Y RECORDATORIOS =====

/**
 * Crear notificación de seguimiento inactivo (3+ días sin registros)
 */
export async function crearNotificacionSeguimientoInactivoService(
  clienteId: string,
  profesionalId: string,
  tipo: 'entrenamiento' | 'nutricion',
  diasInactivo: number
): Promise<INotificacion[]> {
  try {
    const esEntrenamiento = tipo === 'entrenamiento';
    const titulo = esEntrenamiento ? 'Seguimiento de entrenamiento inactivo' : 'Seguimiento de dieta inactivo';
    const contenido = esEntrenamiento 
      ? `El cliente lleva ${diasInactivo} días sin registrar sus sesiones de entrenamiento.`
      : `El cliente lleva ${diasInactivo} días sin registrar sus comidas de la dieta.`;

    // Notificación para el profesional
    const notificacionProfesional: CrearNotificacionData = {
      usuario: profesionalId,
      tipo: esEntrenamiento ? 'entrenamiento' : 'nutricion',
      titulo,
      contenido,
      prioridad: 'normal',
      accion: {
        tipo: 'navegar',
        url: '/clientes'
      },
      metadata: {
        remitente: clienteId
      }
    };

    // Notificación para el cliente
    const notificacionCliente: CrearNotificacionData = {
      usuario: clienteId,
      tipo: esEntrenamiento ? 'entrenamiento' : 'nutricion',
      titulo: esEntrenamiento ? 'Recuerda registrar tus entrenamientos' : 'Recuerda registrar tus comidas',
      contenido: esEntrenamiento 
        ? 'Llevas varios días sin registrar tus sesiones de entrenamiento. ¡Mantén tu rutina!'
        : 'Llevas varios días sin registrar tus comidas. ¡No olvides hacer seguimiento de tu dieta!',
      prioridad: 'normal',
      accion: {
        tipo: esEntrenamiento ? 'abrir_plan' : 'abrir_dieta'
      },
      metadata: {
        remitente: profesionalId
      }
    };

    const [notifProfesional, notifCliente] = await Promise.all([
      crearNotificacionService(notificacionProfesional),
      crearNotificacionService(notificacionCliente)
    ]);

    return [notifProfesional, notifCliente];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear notificación de seguimiento inactivo: ${error.message}`);
    }
    throw new Error('Error desconocido al crear notificación de seguimiento inactivo');
  }
}

/**
 * Obtener notificaciones programadas que deben enviarse ahora
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function obtenerNotificacionesProgramadasService(): Promise<any[]> {
  try {
    const ahora = new Date();
    
    const query = {
      programadaPara: { $lte: ahora },
      enviada: false,
      // Incluir notificaciones sin expiraEn o con expiraEn mayor a ahora
      $or: [
        { expiraEn: { $exists: false } },
        { expiraEn: { $gt: ahora } }
      ]
    };

    const notificaciones = await Notificacion.find(query).lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return notificaciones.map((n: any) => ({
      ...n,
      usuarioId: n.usuario?.toString() || n.usuario
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificaciones programadas: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificaciones programadas');
  }
}

/**
 * Marcar notificación como enviada
 */
export async function marcarNotificacionComoEnviadaService(notificacionId: string): Promise<void> {
  try {
    await Notificacion.findByIdAndUpdate(notificacionId, { enviada: true });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar notificación como enviada: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar notificación como enviada');
  }
}

// ===== FUNCIONES PARA EL CONTROLADOR =====

/**
 * Obtener estadísticas de notificaciones del usuario
 */
export async function obtenerEstadisticasService(usuarioId: string): Promise<{
  total: number;
  noLeidas: number;
  porTipo: {
    mensaje: number;
    sistema: number;
    recordatorio: number;
    entrenamiento: number;
    nutricion: number;
  };
  porPrioridad: {
    baja: number;
    normal: number;
    alta: number;
    urgente: number;
  };
}> {
  try {
    // Total de notificaciones
    const total = await Notificacion.countDocuments({ usuario: usuarioId });

    // Notificaciones no leídas
    const noLeidas = await Notificacion.countDocuments({
      usuario: usuarioId,
      leida: false
    });

    // Por tipo
    const porTipo = await Notificacion.aggregate([
      { $match: { usuario: usuarioId } },
      {
        $group: {
          _id: '$tipo',
          count: { $sum: 1 }
        }
      }
    ]);

    const porTipoResult = {
      mensaje: 0,
      sistema: 0,
      recordatorio: 0,
      entrenamiento: 0,
      nutricion: 0
    };

    porTipo.forEach(item => {
      if (item._id in porTipoResult) {
        porTipoResult[item._id as keyof typeof porTipoResult] = item.count;
      }
    });

    // Por prioridad
    const porPrioridad = await Notificacion.aggregate([
      { $match: { usuario: usuarioId } },
      {
        $group: {
          _id: '$prioridad',
          count: { $sum: 1 }
        }
      }
    ]);

    const porPrioridadResult = {
      baja: 0,
      normal: 0,
      alta: 0,
      urgente: 0
    };

    porPrioridad.forEach(item => {
      if (item._id in porPrioridadResult) {
        porPrioridadResult[item._id as keyof typeof porPrioridadResult] = item.count;
      }
    });

    return {
      total,
      noLeidas,
      porTipo: porTipoResult,
      porPrioridad: porPrioridadResult
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener estadísticas');
  }
}