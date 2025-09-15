import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';
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

export const manejarErrorGenerico = (
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
    if (error.message === 'No se encontró el elemento solicitado') {
      res.status(404).json({ message: 'No se encontró el elemento solicitado' });
      return;
    } else if (error.message === 'No tienes permisos para ver este elemento' || 
               error.message === 'No tienes permisos para actualizar este elemento') {
      res.status(403).json({ message: error.message });
      return;
    } else if (error.message === 'ID inválido' || 
               error.message.includes('Cast to ObjectId failed')) {
      res.status(400).json({ message: 'El ID proporcionado no es válido' });
      return;
    } else if (error.message === 'Índice inválido') {
      res.status(400).json({ message: 'El índice proporcionado no es válido' });
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
