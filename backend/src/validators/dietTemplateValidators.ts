import { body, param } from 'express-validator';
import { TIPOS_DIETA } from '../constants/dietTypes';
import { obtenerTiposArquetipoDisponibles } from '../service/diets/dietTemplateService';

// Validaciones para crear dieta desde plantilla
export const validarCrearDietaDesdePlantilla = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),

  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),

  body('tipo')
    .isArray({ min: 1 })
    .withMessage('El tipo debe ser un array con al menos un elemento')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('El tipo debe ser un array');
      }
      
      const tiposValidos = value.filter(tipo => TIPOS_DIETA.includes(tipo));
      if (tiposValidos.length === 0) {
        throw new Error(`Ninguno de los tipos proporcionados es válido. Tipos disponibles: ${TIPOS_DIETA.join(', ')}`);
      }
      
      return true;
    }),

  body('duracion')
    .isInt({ min: 1, max: 365 })
    .withMessage('La duración debe ser un número entero entre 1 y 365 días'),

  body('comidasDiarias')
    .isInt({ min: 1, max: 10 })
    .withMessage('Las comidas diarias deben ser un número entero entre 1 y 10'),

  body('fechaInicio')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida en formato ISO 8601')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        throw new Error('La fecha de inicio no puede ser anterior a hoy');
      }
      
      // Verificar que no sea más de 1 año en el futuro
      const unAnoDespues = new Date();
      unAnoDespues.setFullYear(unAnoDespues.getFullYear() + 1);
      
      if (fecha > unAnoDespues) {
        throw new Error('La fecha de inicio no puede ser más de un año en el futuro');
      }
      
      return true;
    }),

  body('asignadaA')
    .optional()
    .isArray()
    .withMessage('asignadaA debe ser un array')
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (const id of value) {
          if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new Error('Todos los IDs en asignadaA deben ser ObjectIds válidos de MongoDB');
          }
        }
      }
      return true;
    }),

  body('tipoArquetipo')
    .notEmpty()
    .withMessage('El tipo de arquetipo es requerido')
    .isString()
    .withMessage('El tipo de arquetipo debe ser una cadena')
    .custom((value) => {
      const tiposDisponibles = obtenerTiposArquetipoDisponibles();
      if (!tiposDisponibles.includes(value)) {
        throw new Error(`Tipo de arquetipo "${value}" no válido. Tipos disponibles: ${tiposDisponibles.join(', ')}`);
      }
      return true;
    })
];

// Validaciones para obtener información de arquetipo
export const validarObtenerInfoArquetipo = [
  param('tipo')
    .notEmpty()
    .withMessage('El tipo de arquetipo es requerido')
    .isString()
    .withMessage('El tipo de arquetipo debe ser una cadena')
    .custom((value) => {
      const tiposDisponibles = obtenerTiposArquetipoDisponibles();
      if (!tiposDisponibles.includes(value)) {
        throw new Error(`Tipo de arquetipo "${value}" no válido. Tipos disponibles: ${tiposDisponibles.join(', ')}`);
      }
      return true;
    })
];
