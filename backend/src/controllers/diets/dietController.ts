import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService, obtenerDietaService, actualizarDietaService, actualizarDiaDietaService } from '../../service/diets/dietService';
import { actualizarPlatosService } from '../../service/diets/plateService';
import logger from '../../utils/logger';
import Dieta from '../../models/diets/dieta';

export const crearDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      logger.info('Payload recibido en /api/diets', { payload: req.body });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }    
    const { 
      nombre, 
      descripcion, 
      tipo, 
      duracion, 
      comidasDiarias, 
      asignadaA, 
      fechaInicio,
      horasComidas,
      nombreComidas
    } = req.body;

    logger.debug('Procesando datos para crear dieta', {
      creadorId,
      nombre,
      tipo,
      duracion,
      comidasDiarias,
      asignadaA,
      fechaInicio,
      horasComidas,
      nombreComidas
    });

    if (!horasComidas || !Array.isArray(horasComidas) || horasComidas.length !== comidasDiarias) {
      res.status(400).json({ 
        message: `El array horasComidas debe tener exactamente ${comidasDiarias} elementos` 
      });
      return;
    }

    if (!nombreComidas || !Array.isArray(nombreComidas) || nombreComidas.length !== comidasDiarias) {
      res.status(400).json({ 
        message: `El array nombreComidas debe tener exactamente ${comidasDiarias} elementos` 
      });
      return;
    }

    const dieta = await crearDietaService({
      creadorId,
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      asignadaA,
      fechaInicio,
      horasComidas,
      nombreComidas
    });

    logger.info('Dieta creada correctamente', { dietaId: dieta._id });
    res.status(201).json({ message: 'Dieta creada correctamente', dieta });
  } catch (error) {
    logger.error('Error al crear la dieta', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear la dieta', error: (error as Error).message });
  }
};

export const actualizarPlatos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.info('Intento de actualizar platos sin autenticación', { path: req.path });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const { platos } = req.body;
    logger.info('Actualizando platos', { platosCount: platos?.length || 0 });
    
    // Si es una actualización y hay al menos un plato, verificar si la dieta está publicada
    if (platos && platos.length > 0 && platos[0].dietaId) {
      const dietaId = platos[0].dietaId;
      
      // Verificar que la dieta existe y no está publicada
      const dieta = await Dieta.findById(dietaId);
      
      if (!dieta) {
        logger.info('Intento de actualizar platos de dieta inexistente', { dietaId });
        res.status(404).json({ message: 'No se encontró la dieta solicitada' });
        return;
      }
      
      // Verificar que el usuario es el creador de la dieta
      if (dieta.creador.toString() !== userId) {
        logger.warn('Intento de actualizar platos sin permisos', { 
          dietaId, 
          userId, 
          creadorId: dieta.creador 
        });
        res.status(403).json({ message: 'No tienes permisos para actualizar esta dieta' });
        return;
      }
      
      // Verificar si la dieta está publicada
      if (dieta.draftMode === false) {
        logger.warn('Intento de actualizar platos de dieta publicada', { dietaId, userId });
        res.status(403).json({ message: 'No se pueden actualizar platos de una dieta que ya ha sido publicada' });
        return;
      }
    }
    
    const actualizados = await actualizarPlatosService(platos);
    
    logger.info('Platos actualizados correctamente', { actualizados: actualizados.length });
    res.status(200).json({ message: 'Platos actualizados', platos: actualizados });
  } catch (error) {
    logger.error('Error al actualizar platos', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar los platos',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.info('Intento de acceso no autorizado a dieta', { path: req.path });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const dietaId = req.params.id;
    logger.debug('Solicitud para obtener dieta', { dietaId, userId });
    
    const dieta = await obtenerDietaService(dietaId, userId);
    
    logger.info('Dieta obtenida correctamente', { dietaId });
    res.status(200).json({ dieta });
  } catch (error) {
    logger.error('Error al obtener la dieta', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dietaId: req.params.id
    });
    
    if (error instanceof Error) {
      if (error.message === 'Dieta no encontrada') {
        res.status(404).json({ message: 'No se encontró la dieta solicitada' });
        return;
      } else if (error.message === 'No tienes permisos para ver esta dieta') {
        res.status(403).json({ message: 'No tienes permisos para ver esta dieta' });
        return;
      } else if (error.message === 'ID de dieta inválido') {
        res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Error al obtener la dieta', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
export const actualizarDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.info('Intento de actualizar dieta sin autenticación', { path: req.path });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const dietaId = req.params.id;
    const datosActualizacion = req.body;
    
    logger.debug('Solicitud para actualizar dieta', { 
      dietaId, 
      userId, 
      datosActualizacion
    });
    
    if (!datosActualizacion) {
      res.status(400).json({ message: 'No se proporcionaron datos para actualizar la dieta' });
      return;
    }
    
    // Verificar que la dieta existe y que el usuario tiene permisos
    const dieta = await Dieta.findById(dietaId);
    
    if (!dieta) {
      logger.info('Intento de actualizar dieta inexistente', { dietaId });
      res.status(404).json({ message: 'No se encontró la dieta solicitada' });
      return;
    }
    
    // Verificar que el usuario es el creador de la dieta
    if (dieta.creador.toString() !== userId) {
      logger.warn('Intento de actualizar dieta sin permisos', { 
        dietaId, 
        userId, 
        creadorId: dieta.creador 
      });
      res.status(403).json({ message: 'No tienes permisos para actualizar esta dieta' });
      return;
    }

    // Verificar si la dieta está publicada
    if (dieta.draftMode === false) {
      logger.warn('Intento de actualizar dieta publicada', { dietaId, userId });
      res.status(403).json({ message: 'No se puede actualizar una dieta que ya ha sido publicada' });
      return;
    }
    
    const dietaActualizada = await actualizarDietaService(dietaId, userId, datosActualizacion);
    
    logger.info('Dieta actualizada correctamente', { dietaId });
    res.status(200).json({ message: 'Dieta actualizada correctamente', dieta: dietaActualizada });
  } catch (error) {
    logger.error('Error al actualizar la dieta', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dietaId: req.params.id
    });
    
    if (error instanceof Error) {
      if (error.message === 'Dieta no encontrada') {
        res.status(404).json({ message: 'No se encontró la dieta solicitada' });
        return;
      } else if (error.message === 'No tienes permisos para actualizar esta dieta') {
        res.status(403).json({ message: 'No tienes permisos para actualizar esta dieta' });
        return;
      } else if (error.message === 'ID de dieta inválido') {
        res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar la dieta', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};


export const actualizarDiaDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.info('Intento de actualizar día de dieta sin autenticación', { path: req.path });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const dietaId = req.params.dietaId;
    const diaIndex = parseInt(req.params.diaIndex);
    const datosDia = req.body;
    
    logger.debug('Solicitud para actualizar día de dieta', { 
      dietaId, 
      diaIndex,
      userId, 
      datosDia
    });
    
    if (!datosDia) {
      res.status(400).json({ message: 'No se proporcionaron datos para actualizar el día' });
      return;
    }
    
    // Validar que diaIndex es un número
    if (isNaN(diaIndex)) {
      res.status(400).json({ message: 'El índice del día debe ser un número' });
      return;
    }
    
    // Verificar que la dieta existe y no está publicada
    const dieta = await Dieta.findById(dietaId);
    
    if (!dieta) {
      logger.info('Intento de actualizar día de dieta inexistente', { dietaId });
      res.status(404).json({ message: 'No se encontró la dieta solicitada' });
      return;
    }
    
    // Verificar que el usuario es el creador de la dieta
    if (dieta.creador.toString() !== userId) {
      logger.warn('Intento de actualizar día de dieta sin permisos', { 
        dietaId, 
        userId, 
        creadorId: dieta.creador 
      });
      res.status(403).json({ message: 'No tienes permisos para actualizar esta dieta' });
      return;
    }
    
    // Verificar si la dieta está publicada
    if (dieta.draftMode === false) {
      logger.warn('Intento de actualizar día de dieta publicada', { dietaId, diaIndex, userId });
      res.status(403).json({ message: 'No se puede actualizar una dieta que ya ha sido publicada' });
      return;
    }
    
    const diaActualizado = await actualizarDiaDietaService(dietaId, userId, diaIndex, datosDia);
    
    logger.info('Día de dieta actualizado correctamente', { dietaId, diaIndex });
    res.status(200).json({ 
      message: 'Día actualizado correctamente', 
      dia: diaActualizado 
    });
  } catch (error) {
    logger.error('Error al actualizar día de dieta', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dietaId: req.params.dietaId,
      diaIndex: req.params.diaIndex
    });
    
    if (error instanceof Error) {
      if (error.message === 'Dieta no encontrada') {
        res.status(404).json({ message: 'No se encontró la dieta solicitada' });
        return;
      } else if (error.message === 'No tienes permisos para actualizar esta dieta') {
        res.status(403).json({ message: 'No tienes permisos para actualizar esta dieta' });
        return;
      } else if (error.message === 'ID de dieta inválido') {
        res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
        return;
      } else if (error.message === 'Índice de día inválido') {
        res.status(400).json({ message: 'El índice del día proporcionado no es válido' });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar día de dieta', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const publicarDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.info('Intento de publicar dieta sin autenticación', { path: req.path });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    
    const dietaId = req.params.id;
    
    logger.debug('Solicitud para publicar dieta', { 
      dietaId, 
      userId
    });
    
    // Verificar que la dieta existe y que el usuario tiene permisos
    const dieta = await Dieta.findById(dietaId);
    
    if (!dieta) {
      logger.info('Intento de publicar dieta inexistente', { dietaId });
      res.status(404).json({ message: 'No se encontró la dieta solicitada' });
      return;
    }
    
    // Verificar que el usuario es el creador de la dieta
    if (dieta.creador.toString() !== userId) {
      logger.warn('Intento de publicar dieta sin permisos', { 
        dietaId, 
        userId, 
        creadorId: dieta.creador 
      });
      res.status(403).json({ message: 'No tienes permisos para publicar esta dieta' });
      return;
    }
    
    dieta.draftMode = false;
    await dieta.save();
    
    logger.info('Dieta publicada correctamente', { dietaId });
    res.status(200).json({ 
      message: 'Dieta publicada correctamente', 
      dieta 
    });
  } catch (error) {
    logger.error('Error al publicar dieta', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dietaId: req.params.id
    });
    
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        res.status(400).json({ message: 'ID de dieta inválido' });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Error al publicar la dieta', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
