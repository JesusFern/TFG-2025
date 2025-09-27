import { Response } from 'express';
import { body } from 'express-validator';
import logger from '../../utils/logger';
import Dieta from '../../models/diets/dieta';
import { esIdValido, manejarErrorGenerico } from '../commonValidators';
import { TIPOS_DIETA } from '../../constants/dietTypes';

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
  if (error instanceof Error) {
    if (error.message === 'Dieta no encontrada') {
      res.status(404).json({ message: 'No se encontró la dieta solicitada' });
      return;
    } else if (error.message === 'No tienes permisos para ver esta dieta' || 
               error.message === 'No tienes permisos para actualizar esta dieta') {
      res.status(403).json({ message: error.message });
      return;
    } else if (error.message === 'ID de dieta inválido') {
      res.status(400).json({ message: 'El ID de dieta proporcionado no es válido' });
      return;
    } else if (error.message === 'Índice de día inválido') {
      res.status(400).json({ message: 'El índice del día proporcionado no es válido' });
      return;
    } else if (error.message === 'El usuario asignado debe tener rol user') {
      res.status(400).json({ message: error.message });
      return;
    }
  }
  
  // Usar el manejador genérico para el resto de errores
  manejarErrorGenerico(error, res, operacion, contexto);
};

// Validadores de express-validator para dietas
export const crearDietaValidator = [
  body('nombre')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre es obligatorio y debe tener entre 1 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción debe tener máximo 500 caracteres'),
  
  body('tipo')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un tipo de dieta')
    .custom((value) => {
      return value.every((tipo: string) => TIPOS_DIETA.includes(tipo as typeof TIPOS_DIETA[number]));
    })
    .withMessage('Tipo de dieta inválido. Los tipos válidos son: ' + TIPOS_DIETA.join(', ')),
  
  body('duracion')
    .isInt({ min: 1, max: 365 })
    .withMessage('La duración debe ser un número entero entre 1 y 365 días'),
  
  body('comidasDiarias')
    .isInt({ min: 1, max: 6 })
    .withMessage('Las comidas diarias deben ser un número entero entre 1 y 6'),
  
  body('fechaInicio')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  
  body('asignadaA')
    .optional()
    .isMongoId()
    .withMessage('ID de usuario asignado inválido'),
  
  body('horasComidas')
    .isArray()
    .withMessage('Las horas de comidas deben ser un array'),
  
  body('nombreComidas')
    .isArray()
    .withMessage('Los nombres de comidas deben ser un array')
];

export const actualizarDietaValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción debe tener máximo 500 caracteres'),
  
  body('tipo')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un tipo de dieta')
    .custom((value) => {
      return value.every((tipo: string) => TIPOS_DIETA.includes(tipo as typeof TIPOS_DIETA[number]));
    })
    .withMessage('Tipo de dieta inválido. Los tipos válidos son: ' + TIPOS_DIETA.join(', ')),
  
  body('duracion')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('La duración debe ser un número entero entre 1 y 365 días'),
  
  body('comidasDiarias')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Las comidas diarias deben ser un número entero entre 1 y 6'),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  
  body('draftMode')
    .optional()
    .isBoolean()
    .withMessage('El modo borrador debe ser un valor booleano')
];