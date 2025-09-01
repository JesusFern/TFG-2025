import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log('🔍 Debug validateRequest - URL:', req.originalUrl);
  console.log('🔍 Debug validateRequest - Método:', req.method);
  console.log('🔍 Debug validateRequest - Params:', req.params);
  console.log('🔍 Debug validateRequest - Query:', req.query);
  console.log('🔍 Debug validateRequest - Body:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación:', errors.array());
    res.status(400).json({ errors: errors.array() });
    return;
  }
  
  console.log('✅ Validación exitosa, continuando...');
  next();
  console.log('✅ validateRequest: next() ejecutado correctamente');
};
