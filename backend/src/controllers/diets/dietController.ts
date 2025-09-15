import Dieta from '../../models/diets/dieta';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { crearDietaService, obtenerDietaService, actualizarDietaService, actualizarDiaDietaService, publicarDietaService } from '../../service/diets/dietService';
import { actualizarPlatosService } from '../../service/diets/plateService';
import logger from '../../utils/logger';
import mongoose from 'mongoose';
import { 
  verificarDietaExiste,
  verificarPermisosCreador,
  verificarDietaEditable,
  verificarArraysComidas,
  manejarErrorDieta
} from '../../validators/diets/dietValidators';
import { verificarAutenticacion, esIdValido } from '../../validators/commonValidators';

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
      
      const dieta = await verificarDietaExiste(dietaId, res);
      if (!dieta) return;
      
      if (!verificarPermisosCreador(dieta, userId, res, 'actualizar platos')) return;
      
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
    
    
    if (!datosActualizacion) {
      res.status(400).json({ message: 'No se proporcionaron datos para actualizar la dieta' });
      return;
    }
    
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    if (!verificarPermisosCreador(dieta, userId, res, 'actualizar dieta')) return;
    
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
    
    
    if (!datosDia) {
      res.status(400).json({ message: 'No se proporcionaron datos para actualizar el día' });
      return;
    }
    
    if (isNaN(diaIndex)) {
      res.status(400).json({ message: 'El índice del día debe ser un número' });
      return;
    }
    
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    if (!verificarPermisosCreador(dieta, userId, res, 'actualizar día de dieta')) return;
    
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
    
    
    const result = await publicarDietaService(dietaId, userId);
    
    if (result.platosEliminados > 0) {
      logger.info(`Se eliminaron ${result.platosEliminados} platos vacíos antes de publicar la dieta`, { dietaId });
    }
    
    logger.info('Dieta publicada correctamente', { dietaId, platosEliminados: result.platosEliminados });
    res.status(200).json({ 
      message: 'Dieta publicada correctamente', 
      dieta: result.dieta,
      platosEliminados: result.platosEliminados
    });
  } catch (error) {
    manejarErrorDieta(error, res, 'publicar la dieta', { dietaId: req.params.id });
  }
};

export const crearPlato = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'crear plato');
    if (!userId) return;
    
    const { plato } = req.body;
    const { dietaId, diaIndex, comidaIndex } = plato;
    
    
    if (!plato || !dietaId || typeof diaIndex !== 'number' || typeof comidaIndex !== 'number') {
      res.status(400).json({ message: 'Faltan datos requeridos para crear el plato' });
      return;
    }
    
    const dieta = await verificarDietaExiste(dietaId, res);
    if (!dieta) return;
    
    if (!verificarPermisosCreador(dieta, userId, res, 'crear plato')) return;
    
    if (!verificarDietaEditable(dieta, userId, res, 'crear plato')) return;
    
    if (!dieta.dias[diaIndex]) {
      res.status(400).json({ message: 'El día especificado no existe' });
      return;
    }
    
    if (!dieta.dias[diaIndex].comidas[comidaIndex]) {
      res.status(400).json({ message: 'La comida especificada no existe' });
      return;
    }
    
    const nuevoPlato = {
      orden: plato.orden || (dieta.dias[diaIndex].comidas[comidaIndex].platos.length + 1),
      nombre: plato.nombre || '',
      receta: plato.receta ? new mongoose.Types.ObjectId(plato.receta) : null
    };
    
    dieta.dias[diaIndex].comidas[comidaIndex].platos.push(nuevoPlato);
    
    await dieta.save();
    
    const platoCreado = dieta.dias[diaIndex].comidas[comidaIndex].platos[dieta.dias[diaIndex].comidas[comidaIndex].platos.length - 1];
    
    logger.info('Plato creado correctamente', { dietaId, diaIndex, comidaIndex, platoId: platoCreado._id });
    res.status(201).json({ 
      message: 'Plato creado correctamente', 
      plato: platoCreado 
    });
  } catch (error) {
    manejarErrorDieta(error, res, 'crear el plato', { 
      dietaId: req.body?.plato?.dietaId,
      diaIndex: req.body?.plato?.diaIndex,
      comidaIndex: req.body?.plato?.comidaIndex
    });
  }
};

export const eliminarPlato = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'eliminar plato');
    if (!userId) return;
    
    const { platoId } = req.params;
    
    if (!platoId) {
      res.status(400).json({ message: 'ID del plato es requerido' });
      return;
    }

    if (!esIdValido(platoId)) {
      res.status(400).json({ message: 'ID del plato no es válido' });
      return;
    }

    const platoObjectId = new mongoose.Types.ObjectId(platoId.toString());
    
    const dieta = await Dieta.findOne({ 'dias.comidas.platos._id': platoObjectId });
    if (!dieta) {
      res.status(404).json({ message: 'Plato no encontrado' });
      return;
    }
    
    if (!verificarPermisosCreador(dieta, userId, res, 'eliminar plato')) return;
    
    if (!verificarDietaEditable(dieta, userId, res, 'eliminar plato')) return;
    
    let platoEliminado = null;
    let diaIndex = -1;
    let comidaIndex = -1;
    
    for (let d = 0; d < dieta.dias.length; d++) {
      for (let c = 0; c < dieta.dias[d].comidas.length; c++) {
        const platoIndex = dieta.dias[d].comidas[c].platos.findIndex(
          plato => plato._id?.toString() === platoObjectId.toString()
        );
        
        if (platoIndex !== -1) {
          platoEliminado = dieta.dias[d].comidas[c].platos[platoIndex];
          diaIndex = d;
          comidaIndex = c;
          
          dieta.dias[d].comidas[c].platos.splice(platoIndex, 1);
          
          dieta.dias[d].comidas[c].platos.forEach((plato, index) => {
            plato.orden = index + 1;
          });
          
          break;
        }
      }
      if (platoEliminado) break;
    }
    
    if (!platoEliminado) {
      res.status(404).json({ message: 'Plato no encontrado en la dieta' });
      return;
    }
    
    await dieta.save();
    
    logger.info('Plato eliminado correctamente', { 
      dietaId: dieta._id, 
      platoId, 
      diaIndex, 
      comidaIndex 
    });
    
    res.status(200).json({ 
      message: 'Plato eliminado correctamente',
      plato: platoEliminado,
      diaIndex,
      comidaIndex
    });
  } catch (error) {
    manejarErrorDieta(error, res, 'eliminar el plato', { 
      platoId: req.params.platoId
    });
  }
};

export const obtenerDietasPorWorkerYCliente = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener dietas de cliente');
    if (!userId) return;

    const { workerId, clientId } = req.params;
    if (!workerId || !clientId) {
      res.status(400).json({ message: 'Faltan parámetros workerId o clientId' });
      return;
    }

    if (!esIdValido(workerId) || !esIdValido(clientId)) {
      res.status(400).json({ message: 'Los IDs de worker o cliente no son válidos' });
      return;
    }

    if (userId !== workerId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para ver estas dietas' });
      return;
    }

    const workerObjectId = new mongoose.Types.ObjectId(workerId);
    const clientObjectId = new mongoose.Types.ObjectId(clientId);

    const dietas = await Dieta.find({
      creador: workerObjectId,
      asignadaA: clientObjectId
    }).sort({ createdAt: -1 });

    res.status(200).json({ dietas });
  } catch (error) {
    manejarErrorDieta(error, res, 'obtener las dietas del cliente');
  }
};