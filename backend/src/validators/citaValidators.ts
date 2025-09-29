import { body, param, query, ValidationChain } from 'express-validator';
import Cita from '../models/citas/cita';
import User from '../models/users/user';
import mongoose from 'mongoose';
import { Response } from 'express';
import { manejarErrorValidacion } from '../utils/errorHandler';

// Validadores para crear cita
export const validarCrearCita = (): ValidationChain[] => [
  body('cliente')
    .isMongoId()
    .withMessage('ID de cliente inválido')
    .custom(async (value) => {
      const cliente = await User.findById(value);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      if (cliente.role !== 'user') {
        throw new Error('El usuario no es un cliente');
      }
      return true;
    }),

  body('profesional')
    .isMongoId()
    .withMessage('ID de profesional inválido')
    .custom(async (value) => {
      const profesional = await User.findById(value);
      if (!profesional) {
        throw new Error('Profesional no encontrado');
      }
      if (profesional.role !== 'worker') {
        throw new Error('El usuario no es un profesional');
      }
      return true;
    }),

  body('tipo')
    .isIn(['seguimiento', 'consulta_nutricion', 'consulta_entrenamiento', 'evaluacion', 'revision'])
    .withMessage('Tipo de cita inválido'),

  body('fecha')
    .isISO8601()
    .withMessage('Fecha inválida. Use formato ISO 8601')
    .custom((value) => {
      const fecha = new Date(value);
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      if (fecha < ahora) {
        throw new Error('La fecha no puede ser en el pasado');
      }
      
      // No permitir citas más de 3 meses en el futuro
      const tresMeses = new Date();
      tresMeses.setMonth(tresMeses.getMonth() + 3);
      
      if (fecha > tresMeses) {
        throw new Error('No se pueden programar citas más de 3 meses en el futuro');
      }
      
      return true;
    }),

  body('hora')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido. Use HH:MM'),

  body('duracion')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('La duración debe estar entre 15 y 480 minutos'),

  body('motivo')
    .isLength({ min: 10, max: 500 })
    .withMessage('El motivo debe tener entre 10 y 500 caracteres')
];

// Validadores para actualizar cita
export const validarActualizarCita = (): ValidationChain[] => [
  param('id')
    .isMongoId()
    .withMessage('ID de cita inválido'),

  body('tipo')
    .optional()
    .isIn(['seguimiento', 'consulta_nutricion', 'consulta_entrenamiento', 'evaluacion', 'revision'])
    .withMessage('Tipo de cita inválido'),

  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('Fecha inválida. Use formato ISO 8601')
    .custom((value) => {
      const fecha = new Date(value);
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      if (fecha < ahora) {
        throw new Error('La fecha no puede ser en el pasado');
      }
      return true;
    }),

  body('hora')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido. Use HH:MM'),

  body('duracion')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('La duración debe estar entre 15 y 480 minutos'),

  body('motivo')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('El motivo debe tener entre 10 y 500 caracteres'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'reagendada'])
    .withMessage('Estado de cita inválido')
];

// Validadores para cancelar cita
export const validarCancelarCita = (): ValidationChain[] => [
  param('id')
    .isMongoId()
    .withMessage('ID de cita inválido'),

  body('motivo')
    .isLength({ min: 5, max: 500 })
    .withMessage('El motivo de cancelación debe tener entre 5 y 500 caracteres')
];

// Validadores para reagendar cita
export const validarReagendarCita = (): ValidationChain[] => [
  param('id')
    .isMongoId()
    .withMessage('ID de cita inválido'),

  body('nuevaFecha')
    .isISO8601()
    .withMessage('Nueva fecha inválida. Use formato ISO 8601')
    .custom((value) => {
      const fecha = new Date(value);
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      if (fecha < ahora) {
        throw new Error('La nueva fecha no puede ser en el pasado');
      }
      return true;
    }),

  body('nuevaHora')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de nueva hora inválido. Use HH:MM'),

  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres')
];


// Validadores para obtener citas
// Validador para obtener una cita por ID
export const validarObtenerCita = (): ValidationChain[] => [
  param('id')
    .isMongoId()
    .withMessage('ID de cita inválido')
];

export const validarObtenerCitas = (): ValidationChain[] => [
  query('cliente')
    .optional()
    .isMongoId()
    .withMessage('ID de cliente inválido'),

  query('profesional')
    .optional()
    .isMongoId()
    .withMessage('ID de profesional inválido'),

  query('tipo')
    .optional()
    .isIn(['seguimiento', 'consulta_nutricion', 'consulta_entrenamiento', 'evaluacion', 'revision'])
    .withMessage('Tipo de cita inválido'),

  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'reagendada'])
    .withMessage('Estado de cita inválido'),


  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida'),

  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número positivo')
];

// Validadores para obtener disponibilidad
export const validarObtenerDisponibilidad = (): ValidationChain[] => [
  param('profesionalId')
    .isMongoId()
    .withMessage('ID de profesional inválido'),

  query('fecha')
    .isISO8601()
    .withMessage('Fecha inválida. Use formato ISO 8601')
    .custom((value) => {
      const fecha = new Date(value);
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      if (fecha < ahora) {
        throw new Error('No se puede consultar disponibilidad en el pasado');
      }
      return true;
    })
];

// Funciones auxiliares para validación
export const verificarCitaExiste = async (
  citaId: string,
  res: Response
): Promise<typeof Cita.prototype | null> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(citaId)) {
      res.status(400).json({ message: 'ID de cita inválido' });
      return null;
    }

    const cita = await Cita.findById(citaId);
    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return null;
    }

    return cita;
  } catch (error) {
    console.error('Error al verificar existencia de cita:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
    return null;
  }
};

export const verificarPermisosCita = (
  cita: typeof Cita.prototype,
  usuarioId: string,
  res: Response,
  operacion: string
): boolean => {
  const esCliente = cita.cliente.toString() === usuarioId;
  const esProfesional = cita.profesional.toString() === usuarioId;

  if (!esCliente && !esProfesional) {
    res.status(403).json({ 
      message: `No tienes permisos para ${operacion} esta cita` 
    });
    return false;
  }

  return true;
};

export const verificarCitaEditable = (
  cita: typeof Cita.prototype,
  res: Response,
  operacion: string
): boolean => {
  if (cita.estado === 'completada') {
    res.status(400).json({ 
      message: `No se puede ${operacion} una cita completada` 
    });
    return false;
  }

  if (cita.estado === 'cancelada') {
    res.status(400).json({ 
      message: `No se puede ${operacion} una cita cancelada` 
    });
    return false;
  }

  return true;
};

export const manejarErrorCita = (
  error: unknown,
  res: Response,
  operacion: string,
  contexto: Record<string, unknown> = {}
): void => {
  console.error(`Error al ${operacion}:`, error, contexto);
  manejarErrorValidacion(error, res, operacion);
};
