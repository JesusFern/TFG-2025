import { param, query } from 'express-validator';

// Validadores para estadísticas de clientes (entrenadores)
export const clienteIdValidator = [
  param('clienteId').isMongoId().withMessage('ID de cliente no válido')
];

export const estadisticasClienteValidator = [
  param('clienteId').isMongoId().withMessage('ID de cliente no válido'),
  query('fechaInicio').optional().isISO8601().withMessage('Fecha de inicio debe ser una fecha válida'),
  query('fechaFin').optional().isISO8601().withMessage('Fecha de fin debe ser una fecha válida')
];

export const estadisticasSemanalValidator = [
  param('clienteId').isMongoId().withMessage('ID de cliente no válido'),
  param('numeroSemana').isInt({ min: 1, max: 53 }).toInt().withMessage('Número de semana debe ser un número entre 1 y 53'),
  param('anio').isInt({ min: 2020, max: 2030 }).toInt().withMessage('Año debe ser un número válido')
];

export const progresoEjerciciosValidator = [
  param('clienteId').isMongoId().withMessage('ID de cliente no válido'),
  query('ejercicioId').optional().isMongoId().withMessage('ID de ejercicio no válido')
];

// Validadores para progreso personal (clientes)
export const miProgresoValidator = [
  query('fechaInicio').optional().isISO8601().withMessage('Fecha de inicio debe ser una fecha válida'),
  query('fechaFin').optional().isISO8601().withMessage('Fecha de fin debe ser una fecha válida')
];

export const miProgresoSemanalValidator = [
  query('numeroSemana').isInt({ min: 1, max: 53 }).toInt().withMessage('Número de semana debe ser un número entre 1 y 53'),
  query('anio').isInt({ min: 2020, max: 2030 }).toInt().withMessage('Año debe ser un número válido')
];

export const miProgresoEjerciciosValidator = [
  query('ejercicioId').optional().isMongoId().withMessage('ID de ejercicio no válido')
];

// Validador para detalles del cliente (trabajador)
export const detallesClienteValidator = [
  param('clienteId').isMongoId().withMessage('ID de cliente no válido')
];
