import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const createAssignmentRequestValidation = [
  body('trabajadorSolicitado')
    .notEmpty()
    .withMessage('El ID del trabajador es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID del trabajador no válido');
      }
      return true;
    })
];

export const updateAssignmentRequestStatusValidation = [
  param('requestId')
    .notEmpty()
    .withMessage('El ID de la solicitud es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de la solicitud no válido');
      }
      return true;
    }),
  body('estado')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['aceptada', 'rechazada'])
    .withMessage('El estado debe ser "aceptada" o "rechazada"')
];

export const cancelAssignmentRequestValidation = [
  param('requestId')
    .notEmpty()
    .withMessage('El ID de la solicitud es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de la solicitud no válido');
      }
      return true;
    })
];
