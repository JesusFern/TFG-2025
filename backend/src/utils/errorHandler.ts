import { Response } from 'express';

/**
 * Maneja errores comunes de la aplicación y retorna la respuesta HTTP apropiada
 * @param error - El error a manejar
 * @param res - Objeto Response de Express
 * @param operacion - Descripción de la operación que falló (para logging)
 * @param contexto - Información adicional para logging
 */
export const manejarErrorComun = (
  error: unknown,
  res: Response,
  operacion: string
): void => {
  if (error instanceof Error) {
    const mensaje = error.message.toLowerCase();
    
    // Error 404 - No encontrado
    if (mensaje.includes('no encontrada') || mensaje.includes('no existe')) {
      res.status(404).json({ message: error.message });
      return;
    }
    
    // Error 403 - Sin permisos
    if (mensaje.includes('permisos') || mensaje.includes('no tienes')) {
      res.status(403).json({ message: error.message });
      return;
    }
    
    // Error 400 - Datos inválidos
    if (mensaje.includes('inválido') || mensaje.includes('debe ser') || mensaje.includes('no puede ser') || mensaje.includes('no se puede')) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    // Error 409 - Conflicto
    if (mensaje.includes('ya existe') || mensaje.includes('duplicado')) {
      res.status(409).json({ message: error.message });
      return;
    }
  }
  
  // Error 500 - Error interno del servidor (por defecto)
  res.status(500).json({ 
    message: `Error interno del servidor al ${operacion}` 
  });
};

/**
 * Maneja errores específicos de validación y retorna la respuesta HTTP apropiada
 * @param error - El error de validación a manejar
 * @param res - Objeto Response de Express
 * @param operacion - Descripción de la operación que falló
 */
export const manejarErrorValidacion = (
  error: unknown,
  res: Response,
  operacion: string
): void => {
  if (error instanceof Error) {
    const mensaje = error.message.toLowerCase();
    
    // Error 404 - No encontrado
    if (mensaje.includes('no encontrado') || mensaje.includes('no existe')) {
      res.status(404).json({ message: error.message });
      return;
    }
    
    // Error 403 - Sin permisos
    if (mensaje.includes('permisos') || mensaje.includes('no tienes')) {
      res.status(403).json({ message: error.message });
      return;
    }
    
    // Error 400 - Datos inválidos
    if (mensaje.includes('no puede ser') || mensaje.includes('no se puede')) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    // Error 409 - Conflicto
    if (mensaje.includes('ya existe una cita programada')) {
      res.status(409).json({ message: error.message });
      return;
    }
  }
  
  // Error 500 - Error interno del servidor (por defecto)
  res.status(500).json({ 
    message: `Error interno del servidor al ${operacion}` 
  });
};
