import { body } from 'express-validator';

export const crearIncidenciaValidator = [
  body('descripcion')
    .isString()
    .withMessage('La descripción debe ser un texto')
    .isLength({ min: 1, max: 10000 })
    .withMessage('La descripción debe tener entre 1 y 10000 caracteres')
    .trim(),
];

export const resolverIncidenciaValidator = [
  body('estado')
    .isIn(['Por resolver', 'En proceso de resolución', 'Resuelta'])
    .withMessage('El estado debe ser uno de: Por resolver, En proceso de resolución, Resuelta'),
];

