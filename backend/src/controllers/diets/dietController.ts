import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService } from '../../service/diets/dietService';
import { actualizarPlatosService } from '../../service/diets/plateService';
import logger from '../../utils/logger';

export const crearDieta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      logger.info('Payload recibido en /api/diets', { payload: req.body });
      res.status(401).json({ message: 'No autenticado' });
      return;
    }    
    const { nombre, descripcion, tipo, duracion, comidasDiarias, asignadaA, fechaInicio } = req.body;

    logger.debug('Procesando datos para crear dieta', {
      creadorId,
      nombre,
      tipo,
      duracion,
      comidasDiarias,
      asignadaA,
      fechaInicio
    });

    const dieta = await crearDietaService({
      creadorId,
      nombre,
      descripcion,
      tipo,
      duracion,
      comidasDiarias,
      asignadaA,
      fechaInicio
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

export const actualizarPlatos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platos } = req.body;
    logger.info('Actualizando platos', { platosCount: platos?.length || 0 });
    
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