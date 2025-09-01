import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService, obtenerDietaService, actualizarDietaService, actualizarDiaDietaService } from '../../service/diets/dietService';
import { actualizarPlatosService } from '../../service/diets/plateService';
import logger from '../../utils/logger';
import { 
  verificarAutenticacion,
  verificarDietaExiste,
  verificarPermisosCreador,
  verificarDietaEditable,
  verificarArraysComidas,
  manejarErrorDieta
} from '../../validators/dietValidators';

export const crearDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const creadorId = verificarAutenticacion(req, res, 'crear dieta');
    if (!creadorId) return;
    
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

    // Validar arrays de comidas
    if (!verificarArraysComidas(comidasDiarias, horasComidas, nombreComidas, res)) {
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
    manejarErrorDieta(error, res, 'crear la dieta');
  }
};

export const actualizarPlatos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'actualizar platos');
    if (!userId) return;
    
    const { platos } = req.body;
    logger.info('Actualizando platos', { platosCount: platos?.length || 0 });
    
    // Si es una actualización y hay al menos un plato, verificar permisos en la dieta
    if (platos && platos.length > 0 && platos[0].dietaId) {
      const dietaId = platos[0].dietaId;
      
      // Verificar que la dieta existe
      const dieta = await verificarDietaExiste(dietaId, res);
      if (!dieta) return;
      
      // Verificar que el usuario tiene permisos
      if (!verificarPermisosCreador(dieta, userId, res, 'actualizar platos')) return;
      
      // Verificar que la dieta está en modo borrador
      if (!verificarDietaEditable(dieta, userId, res, 'actualizar platos')) return;
    }
    
    const actualizados = await actualizarPlatosService(platos);
    
    logger.info('Platos actualizados correctamente', { actualizados: actualizados.length });
    res.status(200).json({ message: 'Platos actualizados', platos: actualizados });
  } catch (error) {
    manejarErrorDieta(error, res, 'actualizar los platos');
  }
};

export const obtenerDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener dieta');
    if (!userId) return;
    
    const dietaId = req.params.id;
    logger.debug('Solicitud para obtener dieta', { dietaId, userId });
    
    const dieta = await obtenerDietaService(dietaId, userId);
    
    logger.info('Dieta obtenida correctamente', { dietaId });
    res.status(200).json({ dieta });
  } catch (error) {
    manejarErrorDieta(error, res, 'obtener la dieta', { dietaId: req.params.id });
  }
};
export const actualizarDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'actualizar dieta');
    if (!userId) return;
    
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
    
    // Verificar que la dieta existe
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    // Verificar que el usuario tiene permisos
    if (!verificarPermisosCreador(dieta, userId, res, 'actualizar dieta')) return;
    
    // Verificar que la dieta está en modo borrador
    if (!verificarDietaEditable(dieta, userId, res, 'actualizar dieta')) return;
    
    const dietaActualizada = await actualizarDietaService(dietaId, userId, datosActualizacion);
    
    logger.info('Dieta actualizada correctamente', { dietaId });
    res.status(200).json({ message: 'Dieta actualizada correctamente', dieta: dietaActualizada });
  } catch (error) {
    manejarErrorDieta(error, res, 'actualizar la dieta', { dietaId: req.params.id });
  }
};


export const actualizarDiaDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'actualizar día de dieta');
    if (!userId) return;
    
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
    
    // Verificar que la dieta existe
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    // Verificar que el usuario tiene permisos
    if (!verificarPermisosCreador(dieta, userId, res, 'actualizar día de dieta')) return;
    
    // Verificar que la dieta está en modo borrador
    if (!verificarDietaEditable(dieta, userId, res, 'actualizar día')) return;
    
    const diaActualizado = await actualizarDiaDietaService(dietaId, userId, diaIndex, datosDia);
    
    logger.info('Día de dieta actualizado correctamente', { dietaId, diaIndex });
    res.status(200).json({ 
      message: 'Día actualizado correctamente', 
      dia: diaActualizado 
    });
  } catch (error) {
    manejarErrorDieta(error, res, 'actualizar día de dieta', { 
      dietaId: req.params.dietaId,
      diaIndex: req.params.diaIndex
    });
  }
};

export const publicarDieta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'publicar dieta');
    if (!userId) return;
    
    const dietaId = req.params.id;
    
    logger.debug('Solicitud para publicar dieta', { 
      dietaId, 
      userId
    });
    
    // Verificar que la dieta existe
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    // Verificar que el usuario tiene permisos
    if (!verificarPermisosCreador(dieta, userId, res, 'publicar dieta')) return;
    
    dieta.draftMode = false;
    await dieta.save();
    
    logger.info('Dieta publicada correctamente', { dietaId });
    res.status(200).json({ 
      message: 'Dieta publicada correctamente', 
      dieta 
    });
  } catch (error) {
    manejarErrorDieta(error, res, 'publicar la dieta', { dietaId: req.params.id });
  }
};
