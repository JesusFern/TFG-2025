import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearMensajeService, obtenerMensajesService, obtenerMensajePorIdService, marcarComoLeidoService, archivarMensajeService, eliminarMensajeService } from '../../service/chats/mensajeService';
import { CrearMensajeData, FiltrosMensajes } from '../../models/chats';

// Crear un nuevo mensaje
export const crearMensaje = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const datosMensaje: CrearMensajeData = {
      remitente: usuarioId,
      destinatario: req.body.destinatario,
      contenido: req.body.contenido,
      tipo: req.body.tipo || 'texto',
      prioridad: req.body.prioridad || 'normal',
      categoria: (req.body.categoria || 'general') as 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio',
      adjuntos: req.body.adjuntos,
      metadata: req.body.metadata,
      respuestaA: req.body.respuestaA,
      programadoPara: req.body.programadoPara ? new Date(req.body.programadoPara) : undefined,
      expiraEn: req.body.expiraEn ? new Date(req.body.expiraEn) : undefined
    };

    const mensaje = await crearMensajeService(datosMensaje);
    res.status(201).json({ message: 'Mensaje creado exitosamente', mensaje });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener mensajes con filtros
export const obtenerMensajes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { 
      conversacionId, 
      remitente, 
      destinatario, 
      tipo, 
      estado, 
      categoria, 
      prioridad, 
      fechaDesde, 
      fechaHasta, 
      limit = 20, 
      offset = 0 
    } = req.query;

    const filtros: FiltrosMensajes = {
      conversacionId: conversacionId as string,
      remitente: remitente as string,
      destinatario: destinatario as string,
      tipo: tipo as string,
      estado: estado as string,
      categoria: categoria as string,
      prioridad: prioridad as string,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      limit: Number(limit),
      offset: Number(offset)
    };

    // Aplicar filtros específicos para el usuario autenticado
    if (req.query.misMensajes === 'true') {
      (filtros as Record<string, unknown>).$or = [
        { remitente: usuarioId },
        { destinatario: usuarioId }
      ];
    } else {
      filtros.destinatario = usuarioId; // Solo mensajes recibidos por defecto
    }

    const resultado = await obtenerMensajesService(filtros);
    res.json({ message: 'Mensajes obtenidos exitosamente', ...resultado });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un mensaje específico por ID
export const obtenerMensajePorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const mensaje = await obtenerMensajePorIdService(id);

    if (!mensaje) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }

    // Verificar que el usuario tenga acceso al mensaje
    if (mensaje.remitente !== usuarioId && mensaje.destinatario !== usuarioId) {
      res.status(403).json({ message: 'No tienes acceso a este mensaje' });
      return;
    }

    res.json({ message: 'Mensaje obtenido exitosamente', mensaje });
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Marcar mensaje como leído
export const marcarComoLeido = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const mensaje = await marcarComoLeidoService(id, usuarioId);
    res.json({ message: 'Mensaje marcado como leído', mensaje });
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Archivar mensaje
export const archivarMensaje = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const mensaje = await archivarMensajeService(id, usuarioId);
    res.json({ message: 'Mensaje archivado exitosamente', mensaje });
  } catch (error) {
    console.error('Error al archivar mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un mensaje
export const eliminarMensaje = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;

    // Verificar que el usuario sea el remitente antes de eliminar
    const mensajeExistente = await obtenerMensajePorIdService(id);
    if (!mensajeExistente) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }

    if (mensajeExistente.remitente !== usuarioId) {
      res.status(403).json({ message: 'Solo puedes eliminar tus propios mensajes' });
      return;
    }

    await eliminarMensajeService(id, usuarioId);
    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener mensajes no leídos del usuario
export const obtenerMensajesNoLeidos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;
    
    const filtros = {
      limit: Number(limit),
      offset: Number(offset),
      destinatario: usuarioId,
      estado: { $in: ['enviado', 'entregado'] }
    };

    const resultado = await obtenerMensajesService(filtros as FiltrosMensajes & { estado: { $in: string[] } });
    res.json({ message: 'Mensajes no leídos obtenidos exitosamente', ...resultado });
  } catch (error) {
    console.error('Error al obtener mensajes no leídos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
