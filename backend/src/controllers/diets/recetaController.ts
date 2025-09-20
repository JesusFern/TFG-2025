import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearRecetaService, 
  obtenerRecetasService,
  obtenerRecetasPublicasService,
  obtenerMisRecetasService,
  obtenerRecetasPublicasYPropiasService,
  buscarRecetasService,
  actualizarRecetaService,
  eliminarRecetaService,
  limpiarImagenesHuerfanasService,
  procesarImagenesSubidas
} from '../../service/diets/recetaService';
import {
  validarDatosReceta,
  verificarCreadorNutricionista,
  verificarRecetaExiste,
  verificarPermisosAccesoReceta,
  verificarPermisosEdicionEliminacion,
  manejarErrorReceta
} from '../../validators/diets/recetaValidators';
import { verificarAutenticacion } from '../../validators/commonValidators';
import logger from '../../utils/logger';
import User from '../../models/users/user';

export const crearReceta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'crear receta');
    if (!userId) return;
    
    const {
      nombreReceta,
      ingredientes,
      pasosPreparacion,
      tiempoPreparacion,
      informacionNutricional,
      publica
    } = req.body;

    if (!validarDatosReceta({ nombreReceta, ingredientes, pasosPreparacion, publica }, res)) {
      return;
    }

    if (!await verificarCreadorNutricionista(userId, res)) {
      return;
    }

    const files = req.files as Express.Multer.File[];
    const imagenes = procesarImagenesSubidas(files);

    logger.debug('Procesando datos para crear receta', {
      creadorId: userId,
      nombreReceta,
      ingredientes: ingredientes?.length || 0,
      publica,
      imagesCount: imagenes.length
    });

    const receta = await crearRecetaService({
      nombreReceta,
      ingredientes,
      pasosPreparacion,
      tiempoPreparacion,
      informacionNutricional,
      imagenes,
      publica,
      creadorId: userId
    });

    logger.info('Receta creada correctamente', { recetaId: receta._id });
    res.status(201).json({ 
      message: 'Receta creada correctamente', 
      receta 
    });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'crear la receta');
  }
};

export const obtenerReceta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener receta');
    if (!userId) return;
    
    const recetaId = req.params.id;
    const receta = await verificarRecetaExiste(recetaId, res);
    if (!receta) return;
    
    // Verificar permisos de acceso según las reglas específicas
    if (!await verificarPermisosAccesoReceta(receta, userId, res)) {
      return;
    }
    
    logger.info('Receta obtenida correctamente', { recetaId, userId });
    res.status(200).json({ receta });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'obtener la receta', { recetaId: req.params.id });
  }
};

export const obtenerRecetas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener recetas');
    if (!userId) return;
    
    const recetas = await obtenerRecetasService();
    
    logger.info('Recetas obtenidas correctamente', { cantidad: recetas.length });
    res.status(200).json({ recetas });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'obtener las recetas');
  }
};

export const obtenerRecetasPublicas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener recetas públicas');
    if (!userId) return;
    
    const recetas = await obtenerRecetasPublicasService();
    
    logger.info('Recetas públicas obtenidas correctamente', { cantidad: recetas.length });
    res.status(200).json({ recetas });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'obtener las recetas públicas');
  }
};

export const obtenerMisRecetas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener mis recetas');
    if (!userId) return;
    
    const recetas = await obtenerMisRecetasService(userId);
    
    logger.info('Mis recetas obtenidas correctamente', { 
      creadorId: userId, 
      cantidad: recetas.length 
    });
    res.status(200).json({ recetas });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'obtener mis recetas', { creadorId: req.user?.id });
  }
};

export const obtenerRecetasPublicasYPropias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener recetas públicas y propias');
    if (!userId) return;
    
    const recetas = await obtenerRecetasPublicasYPropiasService(userId);
    
    logger.info('Recetas públicas y propias obtenidas correctamente', { 
      userId, 
      cantidad: recetas.length 
    });
    res.status(200).json({ recetas });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'obtener las recetas públicas y propias', { userId: req.user?.id });
  }
};

export const buscarRecetas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'buscar recetas');
    if (!userId) return;
    
    const termino = req.query.q as string;
    
    const recetas = await buscarRecetasService(termino || '', userId);
    
    logger.info('Búsqueda de recetas realizada correctamente', { 
      userId, 
      termino: termino || 'vacío',
      cantidad: recetas.length 
    });
    res.status(200).json({ recetas });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'buscar recetas', { userId: req.user?.id });
  }
};

export const actualizarReceta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'actualizar receta');
    if (!userId) return;
    
    const recetaId = req.params.id;
    const receta = await verificarRecetaExiste(recetaId, res);
    if (!receta) return;
    
    // Verificar permisos de edición
    if (!await verificarPermisosEdicionEliminacion(receta, userId, res, 'editar')) {
      return;
    }
    
    const {
      nombreReceta,
      ingredientes,
      pasosPreparacion,
      tiempoPreparacion,
      informacionNutricional,
      publica,
      imagenesAEliminar
    } = req.body;

    // Validar datos si se proporcionan
    if (nombreReceta || ingredientes || publica !== undefined) {
      if (!validarDatosReceta({ nombreReceta, ingredientes, pasosPreparacion, publica }, res)) {
        return;
      }
    }

    const files = req.files as Express.Multer.File[];
    const imagenes = procesarImagenesSubidas(files);

    logger.debug('Procesando datos para actualizar receta', {
      recetaId,
      userId,
      nombreReceta,
      ingredientes: ingredientes?.length || 0,
      publica,
      imagesCount: imagenes.length
    });

    const recetaActualizada = await actualizarRecetaService(recetaId, {
      nombreReceta,
      ingredientes,
      pasosPreparacion,
      tiempoPreparacion,
      informacionNutricional,
      imagenes: imagenes.length > 0 ? imagenes : undefined,
      imagenesAEliminar,
      publica
    });

    logger.info('Receta actualizada correctamente', { recetaId, userId });
    res.status(200).json({
      message: 'Receta actualizada correctamente',
      receta: recetaActualizada
    });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'actualizar la receta', { recetaId: req.params.id });
  }
};

export const eliminarReceta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'eliminar receta');
    if (!userId) return;
    
    const recetaId = req.params.id;
    const receta = await verificarRecetaExiste(recetaId, res);
    if (!receta) return;
    
    // Verificar permisos de eliminación
    if (!await verificarPermisosEdicionEliminacion(receta, userId, res, 'eliminar')) {
      return;
    }

    logger.debug('Eliminando receta', { recetaId, userId });

    const recetaEliminada = await eliminarRecetaService(recetaId);

    logger.info('Receta eliminada correctamente', { recetaId, userId });
    res.status(200).json({
      message: 'Receta eliminada correctamente',
      receta: recetaEliminada
    });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'eliminar la receta', { recetaId: req.params.id });
  }
};

export const limpiarImagenesHuerfanas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'limpiar imágenes huérfanas');
    if (!userId) return;
    
    // Solo los administradores pueden limpiar imágenes huérfanas
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Solo los administradores pueden limpiar imágenes huérfanas' });
      return;
    }

    logger.info('Iniciando limpieza de imágenes huérfanas', { userId });

    const resultado = await limpiarImagenesHuerfanasService();

    logger.info('Limpieza de imágenes huérfanas completada', { 
      userId, 
      imagenesEliminadas: resultado.imagenesEliminadas,
      imagenesEncontradas: resultado.imagenesEncontradas
    });

    res.status(200).json({
      message: resultado.mensaje,
      imagenesEliminadas: resultado.imagenesEliminadas,
      imagenesEncontradas: resultado.imagenesEncontradas,
      imagenesHuerfanas: resultado.imagenesHuerfanas
    });
  } catch (error) {
    manejarErrorReceta(error as Error, res, 'limpiar imágenes huérfanas');
  }
};
