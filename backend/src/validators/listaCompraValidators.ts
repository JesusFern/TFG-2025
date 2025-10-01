import { Response, NextFunction } from 'express';
import Dieta from '../models/diets/dieta';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';


export const verificarPermisosListaCompra = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dietaId = req.params.dietaId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!dietaId) {
      res.status(400).json({
        success: false,
        message: 'ID de dieta requerido'
      });
      return;
    }

    // Buscar la dieta con los datos necesarios para la validación
    const dieta = await Dieta.findById(dietaId)
      .populate('creador', 'id role')
      .populate('asignadaA', 'id role');

    if (!dieta) {
      res.status(404).json({
        success: false,
        message: 'Dieta no encontrada'
      });
      return;
    }

    // Verificar si el usuario es el creador de la dieta
    const esCreador = dieta.creador && 
      (typeof dieta.creador === 'object' && dieta.creador._id 
        ? dieta.creador._id.toString() 
        : String(dieta.creador)) === userId;

    // Verificar si el usuario está en la lista de asignados
    const esAsignado = dieta.asignadaA && dieta.asignadaA.some(asignado => {
      const asignadoId = typeof asignado === 'object' && asignado._id 
        ? asignado._id.toString() 
        : String(asignado);
      return asignadoId === userId;
    });

    // Si no es ni creador ni asignado, denegar acceso
    if (!esCreador && !esAsignado) {
      logger.warn('Intento de acceso no autorizado a lista de compra', {
        userId,
        dietaId,
        esCreador,
        esAsignado: !!esAsignado
      });

      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a la lista de compra de esta dieta'
      });
      return;
    }

    logger.info('Acceso autorizado a lista de compra', {
      userId,
      dietaId,
      esCreador,
      esAsignado: !!esAsignado
    });

    next();
  } catch (error) {
    logger.error('Error al verificar permisos de lista de compra', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      userId: req.user?.id,
      dietaId: req.params.dietaId
    });

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar permisos'
    });
  }
};
