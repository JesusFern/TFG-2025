import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearNotificacionService, obtenerNotificacionesService, obtenerNotificacionPorIdService, marcarComoLeidaService, marcarTodasComoLeidasService, eliminarNotificacionService, obtenerNotificacionesNoLeidasService } from '../../service/chats/notificacionService';
import { CrearNotificacionData } from '../../models/chats';

// Crear una nueva notificación
export const crearNotificacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Solo los administradores pueden crear notificaciones del sistema
    if (req.body.tipo === 'sistema' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para crear notificaciones del sistema' });
      return;
    }

    const datosNotificacion: CrearNotificacionData = {
      usuario: req.body.usuario || usuarioId,
      tipo: req.body.tipo as 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion',
      titulo: req.body.titulo,
      contenido: req.body.contenido,
      prioridad: req.body.prioridad || 'normal',
      accion: req.body.accion,
      metadata: req.body.metadata,
      programadoPara: req.body.programadoPara ? new Date(req.body.programadoPara) : undefined,
      expiraEn: req.body.expiraEn ? new Date(req.body.expiraEn) : undefined
    };

    const notificacion = await crearNotificacionService(datosNotificacion);
    res.status(201).json({ message: 'Notificación creada exitosamente', notificacion });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener notificaciones del usuario
export const obtenerNotificaciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { limit = 20, offset = 0, tipo, leida, prioridad } = req.query;
    
    const resultado = await obtenerNotificacionesService({
      usuario: usuarioId,
      tipo: tipo as string,
      leida: leida === 'true',
      prioridad: prioridad as string,
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({ message: 'Notificaciones obtenidas exitosamente', ...resultado });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener una notificación específica por ID
export const obtenerNotificacionPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const notificacion = await obtenerNotificacionPorIdService(id);

    if (!notificacion) {
      res.status(404).json({ message: 'Notificación no encontrada' });
      return;
    }

    // Verificar que el usuario tenga acceso a la notificación
    if (notificacion.usuario !== usuarioId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes acceso a esta notificación' });
      return;
    }

    res.json({ message: 'Notificación obtenida exitosamente', notificacion });
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const notificacion = await marcarComoLeidaService(id, usuarioId);
    res.json({ message: 'Notificación marcada como leída', notificacion });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    await marcarTodasComoLeidasService(usuarioId);
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar una notificación
export const eliminarNotificacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;

    // Verificar que el usuario tenga acceso a la notificación
    const notificacionExistente = await obtenerNotificacionPorIdService(id);
    if (!notificacionExistente) {
      res.status(404).json({ message: 'Notificación no encontrada' });
      return;
    }

    if (notificacionExistente.usuario !== usuarioId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para eliminar esta notificación' });
      return;
    }

    await eliminarNotificacionService(id, usuarioId);
    res.json({ message: 'Notificación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener notificaciones del sistema (solo para administradores)
export const obtenerNotificacionesSistema = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para ver notificaciones del sistema' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;
    const resultado = await obtenerNotificacionesService({
      tipo: 'sistema',
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({ message: 'Notificaciones del sistema obtenidas exitosamente', ...resultado });
  } catch (error) {
    console.error('Error al obtener notificaciones del sistema:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener notificaciones no leídas del usuario
export const obtenerNotificacionesNoLeidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const notificaciones = await obtenerNotificacionesNoLeidasService(usuarioId);
    res.json({ message: 'Notificaciones no leídas obtenidas exitosamente', notificaciones });
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
