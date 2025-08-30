import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearConversacionService, obtenerConversacionesService, obtenerConversacionPorIdService, actualizarConversacionService, archivarConversacionService, obtenerConversacionesUsuarioService } from '../../service/chats/conversacionService';
import { CrearConversacionData } from '../../models/chats';

// Crear una nueva conversación
export const crearConversacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const participantes = req.body.participantes;
    if (!participantes.includes(usuarioId)) {
      participantes.push(usuarioId);
    }

    const datosConversacion: CrearConversacionData = {
      participantes,
      metadata: req.body.metadata ? {
        ...req.body.metadata,
        tipo: req.body.metadata.tipo as 'general' | 'entrenamiento' | 'nutricion' | 'consulta'
      } : undefined,
      configuracion: req.body.configuracion
    };

    const conversacion = await crearConversacionService(datosConversacion);
    res.status(201).json({ message: 'Conversación creada exitosamente', conversacion });
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las conversaciones del usuario
export const obtenerConversaciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { limit = 20, offset = 0, activa, tipo } = req.query;
    
    const resultado = await obtenerConversacionesService({
      participante: usuarioId,
      activa: activa === 'true',
      tipo: tipo as string,
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({ message: 'Conversaciones obtenidas exitosamente', conversaciones: resultado.conversaciones });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener una conversación específica por ID
export const obtenerConversacionPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const conversacion = await obtenerConversacionPorIdService(id);

    if (!conversacion) {
      res.status(404).json({ message: 'Conversación no encontrada' });
      return;
    }

    // Verificar que el usuario sea participante
    const esParticipante = conversacion.participantes.some(p => p._id === usuarioId);
    if (!esParticipante) {
      res.status(403).json({ message: 'No tienes acceso a esta conversación' });
      return;
    }

    res.json({ message: 'Conversación obtenida exitosamente', conversacion });
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una conversación
export const actualizarConversacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const datosActualizacion = req.body;

    // Verificar que el usuario sea participante antes de actualizar
    const conversacionExistente = await obtenerConversacionPorIdService(id);
    if (!conversacionExistente) {
      res.status(404).json({ message: 'Conversación no encontrada' });
      return;
    }

    const conversacion = await actualizarConversacionService(id, datosActualizacion);
    res.json({ message: 'Conversación actualizada exitosamente', conversacion });
  } catch (error) {
    console.error('Error al actualizar conversación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Archivar una conversación
export const archivarConversacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    
    // Verificar que el usuario sea participante antes de archivar
    const conversacionExistente = await obtenerConversacionPorIdService(id);
    if (!conversacionExistente) {
      res.status(404).json({ message: 'Conversación no encontrada' });
      return;
    }

    const conversacion = await archivarConversacionService(id, usuarioId);
    res.json({ message: 'Conversación archivada exitosamente', conversacion });
  } catch (error) {
    console.error('Error al archivar conversación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener conversación entre dos usuarios específicos
export const obtenerConversacionUsuario = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const { otroUsuarioId } = req.params;
    
    const conversaciones = await obtenerConversacionesUsuarioService(usuarioId, Number(req.query.limit) || 20);
    const conversacion = conversaciones.find(c => 
      c.participantes.some(p => p._id === otroUsuarioId)
    );
    
    if (!conversacion) {
      res.status(404).json({ message: 'No se encontró conversación con este usuario' });
      return;
    }

    res.json({ message: 'Conversación obtenida exitosamente', conversacion });
  } catch (error) {
    console.error('Error al obtener conversación con usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de conversaciones
export const obtenerEstadisticasConversaciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const resultado = await obtenerConversacionesService({ participante: usuarioId });
    
    const estadisticas = {
      total: resultado.conversaciones.length,
      activas: resultado.conversaciones.filter(c => c.activa).length,
      archivadas: resultado.conversaciones.filter(c => !c.activa).length,
      conMensajesNoLeidos: resultado.conversaciones.filter(c => {
        const mensajesNoLeidos = c.mensajesNoLeidos.get(usuarioId);
        return mensajesNoLeidos && mensajesNoLeidos > 0;
      }).length
    };

    res.json({ message: 'Estadísticas obtenidas exitosamente', estadisticas });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
