import { Response } from 'express';
import mongoose from 'mongoose';
import { buscarDietaYVerificarPermisos } from './dietHelper';

// Tipos para las validaciones
export interface DietValidationData {
  nombre?: string;
  tipo?: string | string[];
  duracion?: number;
  comidasDiarias?: number;
  fechaInicio?: string;
  dietaOrigenId?: string;
  tipoArquetipo?: string;
}

// Función para enviar respuesta de error
export const sendErrorResponse = (res: Response, status: number, message: string): void => {
  res.status(status).json({
    success: false,
    message
  });
};

// Función para validar campos requeridos básicos
export const validateRequiredFields = (data: DietValidationData, res: Response): boolean => {
  const { nombre, tipo, duracion, comidasDiarias, fechaInicio } = data;
  
  if (!nombre || !tipo || duracion === undefined || duracion === null || comidasDiarias === undefined || comidasDiarias === null || !fechaInicio) {
    sendErrorResponse(res, 400, 'Faltan campos requeridos: nombre, tipo, duracion, comidasDiarias, fechaInicio');
    return false;
  }
  return true;
};

// Función para validar campos requeridos con dietaOrigenId
export const validateRequiredFieldsWithOrigin = (data: DietValidationData, res: Response): boolean => {
  const { nombre, tipo, duracion, comidasDiarias, fechaInicio, dietaOrigenId } = data;
  
  if (!nombre || !tipo || duracion === undefined || duracion === null || comidasDiarias === undefined || comidasDiarias === null || !fechaInicio || !dietaOrigenId) {
    sendErrorResponse(res, 400, 'Faltan campos requeridos: nombre, tipo, duracion, comidasDiarias, fechaInicio, dietaOrigenId');
    return false;
  }
  return true;
};

// Función para validar campos requeridos con tipoArquetipo
export const validateRequiredFieldsWithTemplate = (data: DietValidationData, res: Response): boolean => {
  const { nombre, tipo, duracion, comidasDiarias, fechaInicio, tipoArquetipo } = data;
  
  if (!nombre || !tipo || duracion === undefined || duracion === null || comidasDiarias === undefined || comidasDiarias === null || !fechaInicio || !tipoArquetipo) {
    sendErrorResponse(res, 400, 'Faltan campos requeridos: nombre, tipo, duracion, comidasDiarias, fechaInicio, tipoArquetipo');
    return false;
  }
  return true;
};

// Función para validar duración
export const validateDuration = (duracion: number, res: Response): boolean => {
  if (duracion < 1 || duracion > 365) {
    sendErrorResponse(res, 400, 'La duración debe estar entre 1 y 365 días');
    return false;
  }
  return true;
};

// Función para validar comidas diarias
export const validateDailyMeals = (comidasDiarias: number, res: Response): boolean => {
  if (comidasDiarias < 1 || comidasDiarias > 10) {
    sendErrorResponse(res, 400, 'Las comidas diarias deben estar entre 1 y 10');
    return false;
  }
  return true;
};

// Función para validar fecha de inicio
export const validateStartDate = (fechaInicio: string, res: Response): Date | null => {
  const fechaInicioDate = new Date(fechaInicio);
  if (isNaN(fechaInicioDate.getTime())) {
    sendErrorResponse(res, 400, 'Fecha de inicio inválida');
    return null;
  }
  return fechaInicioDate;
};

// Función para validar ObjectId de dieta origen
export const validateOriginDietId = (dietaOrigenId: string, res: Response): boolean => {
  if (!mongoose.Types.ObjectId.isValid(dietaOrigenId)) {
    sendErrorResponse(res, 400, 'ID de dieta origen inválido');
    return false;
  }
  return true;
};

// Función para validar autenticación
export const validateAuthentication = (userId: string | undefined, res: Response): boolean => {
  if (!userId) {
    sendErrorResponse(res, 401, 'Usuario no autenticado');
    return false;
  }
  return true;
};

// Función para crear respuesta de éxito
export const sendSuccessResponse = (res: Response, status: number, message: string, data: unknown): void => {
  res.status(status).json({
    success: true,
    message,
    data
  });
};

// Función para manejar errores
export const handleError = (error: unknown, res: Response, context: string): void => {
  console.error(`Error en ${context}:`, error);
  res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : 'Error interno del servidor'
  });
};

// Función para validar campos comunes de dieta
export const validateCommonDietFields = (
  data: DietValidationData, 
  res: Response, 
  includeOriginId = false
): boolean => {
  // Validar campos requeridos
  const validationFunction = includeOriginId 
    ? validateRequiredFieldsWithOrigin 
    : validateRequiredFieldsWithTemplate;
  
  if (!validationFunction(data, res)) return false;

  // Validar duración
  if (!validateDuration(data.duracion!, res)) return false;

  // Validar comidas diarias
  if (!validateDailyMeals(data.comidasDiarias!, res)) return false;

  // Validar fecha de inicio
  const fechaInicioDate = validateStartDate(data.fechaInicio!, res);
  if (!fechaInicioDate) return false;

  return true;
};

// Función para crear DTO común de dieta
export const createCommonDietDTO = (
  reqBody: Record<string, unknown>,
  creador: string,
  fechaInicioDate: Date
) => {
  const { nombre, descripcion, tipo, duracion, comidasDiarias, asignadaA } = reqBody;
  
  return {
    nombre: nombre as string,
    descripcion: descripcion as string,
    tipo: Array.isArray(tipo) ? tipo as string[] : [tipo as string],
    duracion: duracion as number,
    comidasDiarias: comidasDiarias as number,
    fechaInicio: fechaInicioDate,
    creador: new mongoose.Types.ObjectId(creador),
    asignadaA: asignadaA ? (Array.isArray(asignadaA) ? (asignadaA as string[]).map((id: string) => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(asignadaA as string)]) : []
  };
};

// Función para procesar creación de dieta exitosa
export const handleDietCreationSuccess = async (
  dieta: unknown,
  creador: string,
  res: Response,
  successMessage: string
) => {
  const dietaCompleta = await buscarDietaYVerificarPermisos(
    (dieta as { _id: { toString(): string } })._id.toString(), 
    creador, 
    false
  );
  
  sendSuccessResponse(res, 201, successMessage, dietaCompleta);
};
