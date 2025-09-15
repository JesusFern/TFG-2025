import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearRecetaService, 
  obtenerRecetasService,
  obtenerRecetasPublicasService,
  obtenerMisRecetasService,
  obtenerRecetasPublicasYPropiasService
} from '../../service/diets/recetaService';
import {
  verificarAutenticacion,
  validarDatosReceta,
  verificarCreadorNutricionista,
  verificarRecetaExiste,
  verificarPermisosAccesoReceta,
  manejarErrorReceta
} from '../../validators/diets/recetaValidators';
import logger from '../../utils/logger';
import path from 'path';

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
    const imagenes: string[] = [];

    if (files && files.length > 0) {
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      files.forEach(file => {
        const relativePath = path.relative(uploadsPath, file.path);
        const normalizedPath = relativePath.replace(/\\/g, '/');
        imagenes.push(`/uploads/${normalizedPath}`);
      });
    }

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
