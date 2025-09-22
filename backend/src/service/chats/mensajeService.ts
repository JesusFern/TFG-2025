import Mensaje from '../../models/chats/mensaje';
import Conversacion from '../../models/chats/conversacion';
import { IMensaje } from '../../models/chats';
import mongoose from 'mongoose';
import { crearNotificacionService } from './notificacionService';

export interface CrearMensajeData {
  remitente: string;
  destinatario: string;
  contenido: string;
  tipo?: 'texto' | 'imagen' | 'archivo' | 'sistema';
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamano: number;
  }>;
  metadata?: {
    planEntrenamiento?: string;
    dieta?: string;
    sesion?: string;
    tags?: string[];
  };
  respuestaA?: string;
  programadoPara?: Date;
  expiraEn?: Date;
}

export interface FiltrosMensajes {
  conversacionId?: string;
  remitente?: string;
  destinatario?: string;
  tipo?: string;
  estado?: string;
  categoria?: string;
  prioridad?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
  offset?: number;
}

export async function crearMensajeService(datos: CrearMensajeData): Promise<IMensaje> {
  try {
    // Crear el mensaje
    const mensaje = new Mensaje({
      ...datos,
      estado: 'enviado'
    });

    const mensajeGuardado = await mensaje.save();

    // Buscar o crear conversación entre los usuarios
    let conversacion = await Conversacion.findOne({
      participantes: { $all: [datos.remitente, datos.destinatario] },
      activa: true
    });

    if (!conversacion) {
      // Crear nueva conversación
      conversacion = new Conversacion({
        participantes: [datos.remitente, datos.destinatario] as unknown as mongoose.Types.ObjectId[],
        ultimoMensaje: mensajeGuardado._id,
        ultimoMensajeContenido: datos.contenido,
        ultimoMensajeFecha: new Date(),
                 ultimoMensajeRemitente: datos.remitente as unknown as mongoose.Types.ObjectId,
        mensajesNoLeidos: new Map([[datos.destinatario, 1]]),
        activa: true,
        metadata: {
          tipo: datos.categoria === 'general' ? 'general' : datos.categoria,
          ...(datos.metadata?.planEntrenamiento && {
            planEntrenamiento: datos.metadata.planEntrenamiento as unknown as mongoose.Types.ObjectId
          }),
          ...(datos.metadata?.dieta && {
            dieta: datos.metadata.dieta as unknown as mongoose.Types.ObjectId
          }),
          ...(datos.metadata?.tags && { tags: datos.metadata.tags })
        }
      });

      await conversacion.save();
    } else {
      // Actualizar conversación existente
      conversacion.ultimoMensaje = mensajeGuardado._id as unknown as mongoose.Types.ObjectId;
      conversacion.ultimoMensajeContenido = datos.contenido;
      conversacion.ultimoMensajeFecha = new Date();
      conversacion.ultimoMensajeRemitente = datos.remitente as unknown as mongoose.Types.ObjectId;
      
      // Incrementar contador de mensajes no leídos
      const contadorActual = conversacion.mensajesNoLeidos.get(datos.destinatario) || 0;
      conversacion.mensajesNoLeidos.set(datos.destinatario, contadorActual + 1);
      
      await conversacion.save();
    }

    // Crear notificación para el destinatario
    try {
      await crearNotificacionService({
        usuario: datos.destinatario,
        tipo: 'mensaje',
        titulo: 'Nuevo mensaje recibido',
        contenido: `Tienes un nuevo mensaje: ${datos.contenido.substring(0, 50)}${datos.contenido.length > 50 ? '...' : ''}`,
        prioridad: datos.prioridad || 'normal',
        accion: {
          tipo: 'abrir_mensaje',
          metadata: {
            mensajeId: (mensajeGuardado._id as unknown as mongoose.Types.ObjectId).toString(),
            conversacionId: (conversacion._id as unknown as mongoose.Types.ObjectId).toString()
          }
        },
        metadata: {
          mensaje: (mensajeGuardado._id as unknown as mongoose.Types.ObjectId).toString(),
          conversacion: (conversacion._id as unknown as mongoose.Types.ObjectId).toString(),
          remitente: datos.remitente
        }
      });
    } catch (error) {
      // Log del error pero no fallar la creación del mensaje
      console.error('Error al crear notificación:', error);
    }

    return mensajeGuardado.toObject() as unknown as IMensaje;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear mensaje: ${error.message}`);
    }
    throw new Error('Error desconocido al crear mensaje');
  }
}

export async function obtenerMensajesService(filtros: FiltrosMensajes): Promise<{
  mensajes: IMensaje[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const { limit = 50, offset = 0, ...restoFiltros } = filtros;
    
    // Construir filtros de consulta
    const filtrosConsulta: Record<string, unknown> = {};
    
    if (restoFiltros.conversacionId) {
      // Buscar mensajes de una conversación específica
      const conversacion = await Conversacion.findById(restoFiltros.conversacionId);
      if (conversacion) {
        filtrosConsulta.$and = [
          { remitente: { $in: conversacion.participantes } },
          { destinatario: { $in: conversacion.participantes } }
        ];
      }
    }
    
    if (restoFiltros.remitente) {
      filtrosConsulta.remitente = restoFiltros.remitente;
    }
    
    if (restoFiltros.destinatario) {
      filtrosConsulta.destinatario = restoFiltros.destinatario;
    }
    
    if (restoFiltros.tipo) {
      filtrosConsulta.tipo = restoFiltros.tipo;
    }
    
    if (restoFiltros.estado) {
      filtrosConsulta.estado = restoFiltros.estado;
    }
    
    if (restoFiltros.categoria) {
      filtrosConsulta.categoria = restoFiltros.categoria;
    }
    
    if (restoFiltros.prioridad) {
      filtrosConsulta.prioridad = restoFiltros.prioridad;
    }
    
    if (restoFiltros.fechaDesde || restoFiltros.fechaHasta) {
      (filtrosConsulta.createdAt as Record<string, Date>) = {};
      if (restoFiltros.fechaDesde) {
        (filtrosConsulta.createdAt as Record<string, Date>).$gte = restoFiltros.fechaDesde;
      }
      if (restoFiltros.fechaHasta) {
        (filtrosConsulta.createdAt as Record<string, Date>).$lte = restoFiltros.fechaHasta;
      }
    }

    // Contar total de mensajes
    const total = await Mensaje.countDocuments(filtrosConsulta);

    // Obtener mensajes con paginación
    const mensajes = await Mensaje.find(filtrosConsulta)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('remitente', 'fullName profilePicture role')
      .populate('destinatario', 'fullName profilePicture role')
      .populate('respuestaA', 'contenido')
      .populate('metadata.planEntrenamiento', 'nombre')
      .populate('metadata.dieta', 'nombre')
      .populate('metadata.sesion', 'tipoEntrenamiento fecha');

    return {
      mensajes: mensajes.map(m => m.toObject() as unknown as IMensaje),
      total,
      limit,
      offset
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener mensajes: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener mensajes');
  }
}

export async function obtenerMensajePorIdService(mensajeId: string): Promise<IMensaje> {
  try {
    const mensaje = await Mensaje.findById(mensajeId)
      .populate('remitente', 'fullName profilePicture role')
      .populate('destinatario', 'fullName profilePicture role')
      .populate('respuestaA', 'contenido')
      .populate('metadata.planEntrenamiento', 'nombre')
      .populate('metadata.dieta', 'nombre')
      .populate('metadata.sesion', 'tipoEntrenamiento fecha');

    if (!mensaje) {
      throw new Error('Mensaje no encontrado');
    }

    return mensaje.toObject() as unknown as IMensaje;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener mensaje: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener mensaje');
  }
}

export async function marcarComoLeidoService(mensajeId: string, usuarioId: string): Promise<void> {
  try {
    const mensaje = await Mensaje.findById(mensajeId);
    
    if (!mensaje) {
      throw new Error('Mensaje no encontrado');
    }

    // Verificar que el usuario sea el destinatario o el remitente
    if (mensaje.destinatario.toString() !== usuarioId && mensaje.remitente.toString() !== usuarioId) {
      throw new Error('No tienes permisos para marcar este mensaje como leído');
    }

    // Solo marcar como leído si el usuario es el destinatario
    if (mensaje.destinatario.toString() === usuarioId) {
      mensaje.estado = 'leido';
      await mensaje.save();

      // Actualizar contador de mensajes no leídos en la conversación
      const conversacion = await Conversacion.findOne({
        participantes: { $all: [mensaje.remitente, mensaje.destinatario] }
      });

      if (conversacion) {
        const contadorActual = conversacion.mensajesNoLeidos.get(usuarioId) || 0;
        if (contadorActual > 0) {
          conversacion.mensajesNoLeidos.set(usuarioId, contadorActual - 1);
          await conversacion.save();
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al marcar mensaje como leído: ${error.message}`);
    }
    throw new Error('Error desconocido al marcar mensaje como leído');
  }
}

export async function eliminarMensajeService(mensajeId: string, usuarioId: string): Promise<void> {
  try {
    const mensaje = await Mensaje.findById(mensajeId);
    
    if (!mensaje) {
      throw new Error('Mensaje no encontrado');
    }

    // Verificar que el usuario sea el remitente
    if (mensaje.remitente.toString() !== usuarioId) {
      throw new Error('Solo puedes eliminar tus propios mensajes');
    }

    await Mensaje.findByIdAndDelete(mensajeId);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar mensaje: ${error.message}`);
    }
    throw new Error('Error desconocido al eliminar mensaje');
  }
}
