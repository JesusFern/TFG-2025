import { body } from 'express-validator';
import mongoose from 'mongoose';

export const validateSubscriptionRequest = [
  body('planId')
    .notEmpty().withMessage('El ID del plan es obligatorio')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de plan no válido');
      }
      return true;
    }),
  body('frecuenciaPago')
    .notEmpty().withMessage('La frecuencia de pago es obligatoria')
    .isIn(['mensual', 'trimestral', 'anual']).withMessage('Frecuencia de pago no válida')
];

export const validateSessionId = [
  body('sessionId')
    .notEmpty().withMessage('El ID de sesión es obligatorio')
];
