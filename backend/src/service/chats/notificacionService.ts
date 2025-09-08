import Notificacion from '../../models/chats/notificacion';
import { INotificacion } from '../../models/chats';

export interface CrearNotificacionData {
  usuario: string;
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
    mensaje?: string;
    conversacion?: string;
    planEntrenamiento?: string;
    dieta?: string;
    sesion?: string;
    remitente?: string;
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

export async function obtenerNotificacionesService(filtros: FiltrosNotificaciones): Promise<{
  notificaciones: INotificacion[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const { limit = 50, offset = 0, ...restoFiltros } = filtros;
    
    // Construir filtros de consulta
    const filtrosConsulta: Record<string, unknown> = {};
    
    if (restoFiltros.usuario) {
      filtrosConsulta.usuario = restoFiltros.usuario;
    }
    
    if (restoFiltros.tipo) {
      filtrosConsulta.tipo = restoFiltros.tipo;
    }
    
    if (restoFiltros.leida !== undefined) {
      filtrosConsulta.leida = restoFiltros.leida;
    }
    
    if (restoFiltros.prioridad) {
      filtrosConsulta.prioridad = restoFiltros.prioridad;
    }

    // Contar total de notificaciones
    const total = await Notificacion.countDocuments(filtrosConsulta);

    // Obtener notificaciones con paginación
    const notificaciones = await Notificacion.find(filtrosConsulta)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return {
      notificaciones: notificaciones.map(n => n.toObject() as unknown as INotificacion),
      total,
      limit,
      offset
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificaciones');
  }
}

export async function obtenerNotificacionPorIdService(notificacionId: string): Promise<INotificacion> {
  try {
    const notificacion = await Notificacion.findById(notificacionId);

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    return notificacion.toObject() as unknown as INotificacion;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener notificación: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener notificación');
  }
}

export async function marcarComoLeidaService(notificacionId: string, usuarioId: string): Promise<void> {
  try {
    const notificacion = await Notificacion.findById(notificacionId);
    
    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    // Verificar que el usuario sea el propietario de la notificación
    if (notificacion.usuario.toString() !== usuarioId) {
      throw new Error('No tienes permisos para marcar esta notificación como leída');
    }

    notificacion.leida = true;
    await notificacion.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar notificación como leída: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar notificación como leída');
  }
}

export async function marcarTodasComoLeidasService(usuarioId: string): Promise<void> {
  try {
    await Notificacion.updateMany(
      { usuario: usuarioId, leida: false },
      { leida: true }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar todas las notificaciones como leídas');
  }
}

export async function eliminarNotificacionService(notificacionId: string, usuarioId: string): Promise<void> {
  try {
    const notificacion = await Notificacion.findById(notificacionId);
    
    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    // Verificar que el usuario sea el propietario de la notificación
    if (notificacion.usuario.toString() !== usuarioId) {
      throw new Error('No tienes permisos para eliminar esta notificación');
    }

    await Notificacion.findByIdAndDelete(notificacionId);
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
    }).sort({ createdAt: -1 });
    
    return notificaciones.map(n => n.toObject() as unknown as INotificacion);
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
