import { query } from 'express-validator';

/**
 * Validadores para búsqueda híbrida de alimentos
 */
export const validarBusquedaHibrida = [
  query('nombre')
    .notEmpty()
    .withMessage('El nombre del alimento es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0')
    .toInt(),

  query('maxResults')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El número máximo de resultados debe ser un entero entre 1 y 100')
    .toInt()
];
