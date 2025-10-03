import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Unificar formato de error con el esperado por tests de valoraciones
    const messages = errors.array().map((e) => e.msg);
    res.status(400).json({ message: messages.join('; '), errors: errors.array() });
    return;
  }
  next();
};
