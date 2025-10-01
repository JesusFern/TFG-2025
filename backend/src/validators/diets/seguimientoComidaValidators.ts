import { body, param, query } from 'express-validator';
import { 
  SATISFACCION_MIN, 
  SATISFACCION_MAX, 
  CUMPLIMIENTO_MIN, 
  CUMPLIMIENTO_MAX, 
  NOTA_MAX_LENGTH
} from '../../types/seguimientoComida';

// Validadores para actualizar seguimiento de un plato
export const actualizarSeguimientoPlatoValidator = [
  param('dietaId')
    .isMongoId()
    .withMessage('ID de dieta inválido'),
    
  param('diaIndex')
    .isInt({ min: 0 })
    .withMessage('Índice de día inválido'),
    
  param('comidaIndex')
    .isInt({ min: 0 })
    .withMessage('Índice de comida inválido'),
    
  param('platoIndex')
    .isInt({ min: 0 })
    .withMessage('Índice de plato inválido'),
    
  body('satisfaccion')
    .optional()
    .isInt({ min: SATISFACCION_MIN, max: SATISFACCION_MAX })
    .withMessage(`La satisfacción debe ser un número entre ${SATISFACCION_MIN} y ${SATISFACCION_MAX}`),
    
  body('cumplimiento')
    .optional()
    .isInt({ min: CUMPLIMIENTO_MIN, max: CUMPLIMIENTO_MAX })
    .withMessage(`El cumplimiento debe ser un número entre ${CUMPLIMIENTO_MIN} y ${CUMPLIMIENTO_MAX}`),
    
  body('notaUsuario')
    .optional()
    .isString()
    .trim()
    .isLength({ max: NOTA_MAX_LENGTH })
    .withMessage(`La nota del usuario no puede exceder ${NOTA_MAX_LENGTH} caracteres`)
];

// Validadores para obtener seguimiento de platos
export const obtenerSeguimientoPlatosValidator = [
  param('dietaId')
    .isMongoId()
    .withMessage('ID de dieta inválido'),
    
  query('diaIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Índice de día inválido'),
    
  query('comidaIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Índice de comida inválido'),
    
  query('satisfaccionMinima')
    .optional()
    .isInt({ min: SATISFACCION_MIN, max: SATISFACCION_MAX })
    .withMessage(`Satisfacción mínima debe estar entre ${SATISFACCION_MIN} y ${SATISFACCION_MAX}`),
    
  query('cumplimientoMinimo')
    .optional()
    .isInt({ min: CUMPLIMIENTO_MIN, max: CUMPLIMIENTO_MAX })
    .withMessage(`Cumplimiento mínimo debe estar entre ${CUMPLIMIENTO_MIN} y ${CUMPLIMIENTO_MAX}`),
    
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida. Use formato ISO 8601'),
    
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida. Use formato ISO 8601'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número positivo')
];

// Validadores para obtener estadísticas de seguimiento
export const obtenerEstadisticasSeguimientoValidator = [
  param('dietaId')
    .isMongoId()
    .withMessage('ID de dieta inválido'),
    
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida. Use formato ISO 8601'),
    
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida. Use formato ISO 8601'),
    
  query('incluirTendencias')
    .optional()
    .isBoolean()
    .withMessage('Incluir tendencias debe ser un valor booleano')
];

// Validadores para obtener estadísticas generales
export const obtenerEstadisticasGeneralesValidator = [
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida. Use formato ISO 8601'),
    
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida. Use formato ISO 8601')
];

// Validadores para obtener estadísticas semanales
export const obtenerEstadisticasSemanalValidator = [
  query('numeroSemana')
    .isInt({ min: 1, max: 53 })
    .withMessage('Número de semana debe estar entre 1 y 53'),
    
  query('año')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Año debe estar entre 2020 y 2030')
];

// Validadores para obtener progreso de comidas
export const obtenerProgresoComidasValidator = [
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número positivo'),
    
  query('ordenarPor')
    .optional()
    .isIn(['satisfaccion', 'cumplimiento', 'fecha'])
    .withMessage('Ordenar por debe ser: satisfaccion, cumplimiento o fecha'),
    
  query('orden')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser: asc o desc')
];

// Validadores para obtener rachas nutricionales
export const obtenerRachasNutricionalesValidator = [
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida. Use formato ISO 8601'),
    
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida. Use formato ISO 8601')
];

