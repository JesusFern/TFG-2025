import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';
import Dieta from '../../models/diets/dieta';
import mongoose from 'mongoose';

export const verificarAutenticacion = (
  req: AuthenticatedRequest, 
  res: Response, 
  operacion: string
): string | null => {
  const userId = req.user?.id;
  if (!userId) {
    logger.info(`Intento de ${operacion} sin autenticación`, { path: req.path });
    res.status(401).json({ message: 'No autenticado' });
    return null;
  }
  return userId;
};

export const esIdValido = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const verificarDietaExiste = async (
  dietaId: string,
  res: Response
): Promise<typeof Dieta.prototype | null> => {
  if (!esIdValido(dietaId)) {
    res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
    return null;
  }
  
  const dieta = await Dieta.findById(dietaId);
  
  if (!dieta) {
    res.status(404).json({ message: 'No se encontró la dieta solicitada' });
    return null;
  }
  
  return dieta;
};

export const verificarPermisosCreador = (
  dieta: typeof Dieta.prototype, 
  userId: string, 
  res: Response,
  operacion: string
): boolean => {
  if (dieta.creador.toString() !== userId) {
    logger.warn(`Intento de ${operacion} sin permisos`, { 
      dietaId: dieta._id, 
      userId, 
      creadorId: dieta.creador 
    });
    res.status(403).json({ message: `No tienes permisos para ${operacion} esta dieta` });
    return false;
  }
  return true;
};

export const verificarDietaEditable = (
  dieta: typeof Dieta.prototype, 
  userId: string, 
  res: Response,
  operacion: string
): boolean => {
  if (dieta.draftMode === false) {
    logger.warn(`Intento de ${operacion} dieta publicada`, { 
      dietaId: dieta._id, 
      userId 
    });
    
    let mensaje = 'No se puede actualizar una dieta que ya ha sido publicada';
    if (operacion === 'actualizar platos') {
      mensaje = 'No se pueden actualizar platos de una dieta que ya ha sido publicada';
    }
    
    res.status(403).json({ message: mensaje });
    return false;
  }
  return true;
};

export const verificarArraysComidas = (
  comidasDiarias: number,
  horasComidas: string[] | undefined,
  nombreComidas: string[] | undefined,
  res: Response
): boolean => {
  if (!horasComidas || !Array.isArray(horasComidas) || horasComidas.length !== comidasDiarias) {
    res.status(400).json({ 
      message: `El array horasComidas debe tener exactamente ${comidasDiarias} elementos` 
    });
    return false;
  }

  if (!nombreComidas || !Array.isArray(nombreComidas) || nombreComidas.length !== comidasDiarias) {
    res.status(400).json({ 
      message: `El array nombreComidas debe tener exactamente ${comidasDiarias} elementos` 
    });
    return false;
  }
  
  return true;
};

export const manejarErrorDieta = (
  error: unknown,
  res: Response,
  operacion: string,
  contexto: Record<string, unknown> = {}
): void => {
  logger.error(`Error al ${operacion}`, { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...contexto
  });
  
  if (error instanceof Error) {
    if (error.message === 'Dieta no encontrada') {
      res.status(404).json({ message: 'No se encontró la dieta solicitada' });
      return;
    } else if (error.message === 'No tienes permisos para ver esta dieta' || 
               error.message === 'No tienes permisos para actualizar esta dieta') {
      res.status(403).json({ message: error.message });
      return;
    } else if (error.message === 'ID de dieta inválido' || 
               error.message.includes('Cast to ObjectId failed')) {
      res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
      return;
    } else if (error.message === 'Índice de día inválido') {
      res.status(400).json({ message: 'El índice del día proporcionado no es válido' });
      return;
    } else if (error.message === 'El usuario asignado debe tener rol user') {
      res.status(400).json({ message: error.message });
      return;
    } else if (error.message.includes('La duración debe ser')) {
      res.status(400).json({ message: error.message });
      return;
    } else if (error.message.includes('El número de comidas diarias')) {
      res.status(400).json({ message: error.message });
      return;
    } else if (error.message === 'La fecha de inicio es obligatoria') {
      res.status(400).json({ message: error.message });
      return;
    } else if (error.message.includes('La fecha de inicio debe ser')) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(400).json({ 
      message: `Error al ${operacion}`, 
      error: error.message 
    });
    return;
  }
  
  res.status(500).json({ 
    message: `Error al ${operacion}`, 
    error: 'Error desconocido' 
  });
};
