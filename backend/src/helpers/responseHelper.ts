import { Response } from 'express';
import logger from '../utils/logger';

interface ResponseData {
  success: boolean;
  message: string;
  estadisticas?: unknown;
}

export const sendSuccessResponse = (
  res: Response, 
  message: string, 
  data?: unknown, 
  statusCode: number = 200
) => {
  const responseData: ResponseData = {
    success: true,
    message,
    ...(data ? { estadisticas: data } : {})
  };

  logger.info(message, { statusCode });
  res.status(statusCode).json(responseData);
};

export const sendErrorResponse = (
  res: Response, 
  message: string, 
  error: unknown, 
  statusCode: number = 400
) => {
  logger.error(message, {
    error: error instanceof Error ? error.message : String(error),
    statusCode
  });
  
  res.status(statusCode).json({ 
    success: false,
    message, 
    error: error instanceof Error ? error.message : String(error) 
  });
};

export const convertDates = (fechaInicio?: string, fechaFin?: string) => {
  return {
    fechaInicioDate: fechaInicio ? new Date(fechaInicio) : undefined,
    fechaFinDate: fechaFin ? new Date(fechaFin) : undefined
  };
};

export const parseWeekAndYear = (numeroSemana: string, anio: string) => {
  return {
    numeroSemanaNum: parseInt(numeroSemana),
    anioNum: parseInt(anio)
  };
};
