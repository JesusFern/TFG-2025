import { body, param, query } from 'express-validator';
import User from '../models/users/user';

// Validadores para crear una valoración
export const createValoracionValidator = [
  body('trabajadorId')
    .notEmpty()
    .withMessage('El ID del trabajador es obligatorio')
    .isMongoId()
    .withMessage('El ID del trabajador no es válido')
    .custom(async (value) => {
      const trabajador = await User.findById(value);
      if (!trabajador || trabajador.role !== 'worker') {
        throw new Error('El trabajador no existe o no tiene rol de worker');
      }
      return true;
    }),
  
  body('calificacion')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entero entre 1 y 5'),
  
  body('descripcion')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim(),
  
  body('tipoTrabajador')
    .isIn(['Nutricionista', 'Entrenador personal'])
    .withMessage('El tipo de trabajador debe ser "Nutricionista" o "Entrenador personal"'),
  
  body('fechaValoracion')
    .optional()
    .isISO8601()
    .withMessage('La fecha de valoración debe ser válida')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('La fecha de valoración no puede ser futura');
      }
      return true;
    })
];

// Validadores para actualizar una valoración
export const updateValoracionValidator = [
  param('id')
    .isMongoId()
    .withMessage('El ID de la valoración no es válido'),
  
  body('calificacion')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entero entre 1 y 5'),
  
  body('descripcion')
    .optional()
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim(),
  
  body('activa')
    .optional()
    .isBoolean()
    .withMessage('El campo activa debe ser un booleano')
];

// Validadores para obtener valoraciones
export const getValoracionesValidator = [
  query('trabajadorId')
    .optional()
    .isMongoId()
    .withMessage('El ID del trabajador no es válido'),
  
  query('clienteId')
    .optional()
    .isMongoId()
    .withMessage('El ID del cliente no es válido'),
  
  query('tipoTrabajador')
    .optional()
    .isIn(['Nutricionista', 'Entrenador personal'])
    .withMessage('El tipo de trabajador debe ser "Nutricionista" o "Entrenador personal"'),
  
  query('calificacionMin')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación mínima debe ser entre 1 y 5'),
  
  query('calificacionMax')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación máxima debe ser entre 1 y 5'),
  
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('La fecha desde debe ser válida'),
  
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('La fecha hasta debe ser válida'),
  
  query('activa')
    .optional()
    .isBoolean()
    .withMessage('El campo activa debe ser un booleano'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  
  query('sortBy')
    .optional()
    .isIn(['fechaValoracion', 'calificacion', 'createdAt'])
    .withMessage('El campo de ordenamiento debe ser fechaValoracion, calificacion o createdAt'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser asc o desc')
];

// Validadores para obtener una valoración específica
export const getValoracionValidator = [
  param('id')
    .isMongoId()
    .withMessage('El ID de la valoración no es válido')
];

// Validadores para eliminar una valoración
export const deleteValoracionValidator = [
  param('id')
    .isMongoId()
    .withMessage('El ID de la valoración no es válido')
];

// Validadores para obtener estadísticas de valoraciones
export const getEstadisticasValidator = [
  query('trabajadorId')
    .optional()
    .isMongoId()
    .withMessage('El ID del trabajador no es válido'),
  
  query('tipoTrabajador')
    .optional()
    .isIn(['Nutricionista', 'Entrenador personal'])
    .withMessage('El tipo de trabajador debe ser "Nutricionista" o "Entrenador personal"'),
  
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('La fecha desde debe ser válida'),
  
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('La fecha hasta debe ser válida')
];

// Validador personalizado para verificar que el cliente puede valorar al trabajador
export const validateClientePuedeValorar = async (
  req: { user?: { id?: string } ; body: { trabajadorId: string; tipoTrabajador: 'Nutricionista' | 'Entrenador personal' }},
  res: { status: (code: number) => { json: (body: unknown) => void }},
  next: () => void
) => {
  try {
    const { trabajadorId, tipoTrabajador } = req.body;
    const clienteId = req.user?.id;

    if (!clienteId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // Verificar que el cliente está asignado al trabajador
    const trabajador = await User.findById(trabajadorId);
    if (!trabajador || trabajador.role !== 'worker') {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    const asignacion = trabajador.clientesAsignados?.find(
      (asignacion: { clienteId: { toString: () => string }; tipoAsignacion: 'Nutricionista' | 'Entrenador personal' }) => 
        asignacion.clienteId.toString() === clienteId &&
        asignacion.tipoAsignacion === tipoTrabajador
    );

    if (!asignacion) {
      return res.status(403).json({ 
        message: 'No tienes permisos para valorar a este trabajador' 
      });
    }

    next();
  } catch (e) {
    void e; // silenciar variable no usada
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
