import Conversacion from '../../models/chats/conversacion';
import { IConversacion } from '../../models/chats';
import mongoose from 'mongoose';

export interface CrearConversacionData {
  participantes: string[];
  metadata?: {
    planEntrenamiento?: string;
    dieta?: string;
    tipo?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
    tags?: string[];
  };
  configuracion?: {
    notificaciones: boolean;
    sonido: boolean;
    recordatorios: boolean;
  };
}

export interface ActualizarConversacionData {
  activa?: boolean;
  metadata?: {
    planEntrenamiento?: string;
    dieta?: string;
    tipo?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
    tags?: string[];
  };
  configuracion?: {
    notificaciones?: boolean;
    sonido?: boolean;
    recordatorios?: boolean;
  };
}

export interface FiltrosConversaciones {
  participante?: string;
  tipo?: string;
  activa?: boolean;
  limit?: number;
  offset?: number;
}

export async function crearConversacionService(datos: CrearConversacionData): Promise<IConversacion> {
  try {
    const conversacionExistente = await Conversacion.findOne({
      participantes: { $all: datos.participantes },
      activa: true
    });

    if (conversacionExistente) {
      throw new Error('Ya existe una conversación activa entre estos participantes');
    }

    const conversacion = new Conversacion({
      participantes: datos.participantes as unknown as mongoose.Types.ObjectId[],
      mensajesNoLeidos: new Map(),
      activa: true,
      metadata: datos.metadata || { tipo: 'general' },
      configuracion: datos.configuracion || { notificaciones: true, sonido: true, recordatorios: true }
    });

    const conversacionGuardada = await conversacion.save();
    const resultado = conversacionGuardada.toObject() as unknown as IConversacion;
    
    return resultado;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear conversación: ${error.message}`);
    }
    throw new Error('Error desconocido al crear conversación');
  }
}

export async function obtenerConversacionesService(filtros: FiltrosConversaciones): Promise<{
  conversaciones: IConversacion[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const { limit = 50, offset = 0, ...restoFiltros } = filtros;
    
    // Construir filtros de consulta
    const filtrosConsulta: Record<string, unknown> = {};
    
    if (restoFiltros.participante) {
             filtrosConsulta.participantes = restoFiltros.participante as unknown as mongoose.Types.ObjectId;
    }
    
    if (restoFiltros.tipo) {
      filtrosConsulta['metadata.tipo'] = restoFiltros.tipo;
    }
    
    if (restoFiltros.activa !== undefined) {
      filtrosConsulta.activa = restoFiltros.activa;
    }

    // Contar total de conversaciones
    const total = await Conversacion.countDocuments(filtrosConsulta);

    // Obtener conversaciones con paginación
    const conversaciones = await Conversacion.find(filtrosConsulta)
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);

    return {
      conversaciones: conversaciones.map(c => c.toObject() as unknown as IConversacion),
      total,
      limit,
      offset
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener conversaciones: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener conversaciones');
  }
}

export async function obtenerConversacionPorIdService(conversacionId: string): Promise<IConversacion> {
  try {
    const conversacion = await Conversacion.findById(conversacionId);
    
    if (!conversacion) {
      throw new Error('Conversación no encontrada');
    }

    return conversacion.toObject() as unknown as IConversacion;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener conversación: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener conversación');
  }
}

export async function actualizarConversacionService(
  conversacionId: string, 
  datos: ActualizarConversacionData
): Promise<IConversacion> {
  try {
    const conversacion = await Conversacion.findById(conversacionId);
    
    if (!conversacion) {
      throw new Error('Conversación no encontrada');
    }

    if (datos.activa !== undefined) {
      conversacion.activa = datos.activa;
    }

    if (datos.metadata) {
      // Asegurar que siempre se mantenga el tipo
      const tipoActual = conversacion.metadata?.tipo || 'general';
      
      if (datos.metadata.planEntrenamiento) {
        conversacion.metadata = {
          ...conversacion.metadata,
          planEntrenamiento: datos.metadata.planEntrenamiento as unknown as mongoose.Types.ObjectId,
          tipo: tipoActual
        };
      }
      if (datos.metadata.dieta) {
        conversacion.metadata = {
          ...conversacion.metadata,
          dieta: datos.metadata.dieta as unknown as mongoose.Types.ObjectId,
          tipo: tipoActual
        };
      }
      if (datos.metadata.tags) {
        conversacion.metadata = {
          ...conversacion.metadata,
          tags: datos.metadata.tags,
          tipo: tipoActual
        };
      }
      if (datos.metadata.tipo) {
        conversacion.metadata = {
          ...conversacion.metadata,
          tipo: datos.metadata.tipo
        };
      }
    }

    if (datos.configuracion) {
      conversacion.configuracion = {
        notificaciones: datos.configuracion.notificaciones ?? conversacion.configuracion?.notificaciones ?? true,
        sonido: datos.configuracion.sonido ?? conversacion.configuracion?.sonido ?? true,
        recordatorios: datos.configuracion.recordatorios ?? conversacion.configuracion?.recordatorios ?? true
      };
    }

    const conversacionActualizada = await conversacion.save();
    return conversacionActualizada.toObject() as unknown as IConversacion;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al actualizar conversación: ${error.message}`);
    }
    throw new Error('Error desconocido al actualizar conversación');
  }
}

export async function archivarConversacionService(conversacionId: string, usuarioId: string): Promise<void> {
  try {
    const conversacion = await Conversacion.findById(conversacionId);
    
    if (!conversacion) {
      throw new Error('Conversación no encontrada');
    }

    // Verificar que el usuario sea participante
    if (!conversacion.participantes.includes(usuarioId as unknown as mongoose.Types.ObjectId)) {
      throw new Error('No tienes permisos para archivar esta conversación');
    }

    conversacion.activa = false;
    await conversacion.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al archivar conversación: ${error.message}`);
    }
    throw new Error('Error desconocido al archivar conversación');
  }
}

export async function obtenerConversacionesUsuarioService(
  usuarioId: string, 
  limit = 20
): Promise<IConversacion[]> {
  try {
    const conversaciones = await Conversacion.find({
      participantes: usuarioId,
      activa: true
    })
    .populate('participantes', 'fullName email role profilePicture')
    .sort({ updatedAt: -1 })
    .limit(limit);

    return conversaciones.map(c => {
      const conversacion = c.toObject() as unknown as IConversacion;
      
      // Asegurar que los participantes tengan el formato correcto
      if (conversacion.participantes) {
        conversacion.participantes = conversacion.participantes.map((p: unknown) => {
          const participant = p as { _id?: string; fullName?: string; email?: string; role?: string; profilePicture?: string | null } | string;
          
          if (typeof participant === 'string') {
            return {
              _id: participant,
              fullName: 'Usuario',
              email: '',
              role: 'user',
              profilePicture: null
            };
          }
          
          return {
            _id: participant._id || '',
            fullName: participant.fullName || 'Usuario',
            email: participant.email || '',
            role: participant.role || 'user',
            profilePicture: participant.profilePicture || null
          };
        });
      }
      
      return conversacion;
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener conversaciones del usuario: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener conversaciones del usuario');
  }
}

export async function obtenerConversacionEntreUsuariosService(
  usuario1: string, 
  usuario2: string
): Promise<IConversacion | null> {
  try {
    const conversacion = await Conversacion.findOne({
      participantes: { $all: [usuario1, usuario2] },
      activa: true
    });

    return conversacion ? conversacion.toObject() as unknown as IConversacion : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener conversación entre usuarios: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener conversación entre usuarios');
  }
}

export async function actualizarContadorMensajesNoLeidosService(
  conversacionId: string, 
  usuarioId: string, 
  incremento: number
): Promise<void> {
  try {
    const conversacion = await Conversacion.findById(conversacionId);
    
    if (!conversacion) {
      throw new Error('Conversación no encontrada');
    }

    const contadorActual = conversacion.mensajesNoLeidos.get(usuarioId) || 0;
    conversacion.mensajesNoLeidos.set(usuarioId, contadorActual + incremento);
    
    await conversacion.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al actualizar contador de mensajes no leídos: ${error.message}`);
    }
    throw new Error('Error desconocido al actualizar contador de mensajes no leídos');
  }
}

export async function obtenerEstadisticasConversacionesService(usuarioId: string): Promise<{
  totalConversaciones: number;
  conversacionesActivas: number;
  totalMensajesNoLeidos: number;
  conversacionesPorTipo: Record<string, number>;
}> {
  try {
    const conversaciones = await Conversacion.find({
      participantes: usuarioId
    });

    const totalConversaciones = conversaciones.length;
    const conversacionesActivas = conversaciones.filter(c => c.activa).length;
    
    let totalMensajesNoLeidos = 0;
    const conversacionesPorTipo: Record<string, number> = {};

    conversaciones.forEach(c => {
      // Sumar mensajes no leídos del usuario
      const mensajesNoLeidos = c.mensajesNoLeidos.get(usuarioId) || 0;
      totalMensajesNoLeidos += mensajesNoLeidos;

      // Contar por tipo
      const tipo = c.metadata?.tipo || 'general';
      conversacionesPorTipo[tipo] = (conversacionesPorTipo[tipo] || 0) + 1;
    });

    return {
      totalConversaciones,
      conversacionesActivas,
      totalMensajesNoLeidos,
      conversacionesPorTipo
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener estadísticas');
  }
}
