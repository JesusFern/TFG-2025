import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import {
  obtenerNotificacionesService,
  obtenerNotificacionPorIdService,
  marcarComoLeidaService,
  marcarTodasComoLeidasService,
  eliminarNotificacionService,
  obtenerEstadisticasService
} from '../../service/chats/notificacionService';
import logger from '../../utils/logger';

/**
 * Obtener notificaciones del usuario con filtros
 */
export const obtenerNotificaciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const {
      limit = 20,
      offset = 0,
      tipo,
      prioridad,
      leida,
      orden = 'desc'
    } = req.query;

    const filtros = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      tipo: tipo as string,
      prioridad: prioridad as string,
      leida: leida === 'true' ? true : leida === 'false' ? false : undefined,
      orden: orden as 'asc' | 'desc'
    };

    const resultado = await obtenerNotificacionesService(userId, filtros);
    
    logger.info('Notificaciones obtenidas correctamente', { 
      userId, 
      total: resultado.total,
      filtros 
    });

    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al obtener notificaciones:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener notificaciones no leídas del usuario
 */
export const obtenerNotificacionesNoLeidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { limit = 10 } = req.query;

    const filtros = {
      limit: parseInt(limit as string),
      offset: 0,
      leida: false,
      orden: 'desc' as const
    };

    const resultado = await obtenerNotificacionesService(userId, filtros);
    
    logger.info('Notificaciones no leídas obtenidas correctamente', { 
      userId, 
      total: resultado.total 
    });

    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener una notificación específica por ID
 */
export const obtenerNotificacionPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const notificacion = await obtenerNotificacionPorIdService(id, userId);
    
    logger.info('Notificación obtenida correctamente', { 
      userId, 
      notificacionId: id 
    });

    res.status(200).json({ notificacion });
  } catch (error) {
    logger.error('Error al obtener notificación por ID:', error);
    
    if (error instanceof Error && error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};

/**
 * Marcar una notificación como leída
 */
export const marcarComoLeida = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    await marcarComoLeidaService(id, userId);
    
    logger.info('Notificación marcada como leída', { 
      userId, 
      notificacionId: id 
    });

    res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    logger.error('Error al marcar notificación como leída:', error);
    
    if (error instanceof Error && error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const resultado = await marcarTodasComoLeidasService(userId);
    
    logger.info('Todas las notificaciones marcadas como leídas', { 
      userId, 
      actualizadas: resultado.actualizadas 
    });

    res.status(200).json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      actualizadas: resultado.actualizadas
    });
  } catch (error) {
    logger.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar una notificación
 */
export const eliminarNotificacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    await eliminarNotificacionService(id, userId);
    
    logger.info('Notificación eliminada correctamente', { 
      userId, 
      notificacionId: id 
    });

    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    logger.error('Error al eliminar notificación:', error);
    
    if (error instanceof Error && error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};

/**
 * Obtener estadísticas de notificaciones del usuario
 */
export const obtenerEstadisticas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const estadisticas = await obtenerEstadisticasService(userId);
    
    logger.info('Estadísticas de notificaciones obtenidas correctamente', { 
      userId 
    });

    res.status(200).json(estadisticas);
  } catch (error) {
    logger.error('Error al obtener estadísticas de notificaciones:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};