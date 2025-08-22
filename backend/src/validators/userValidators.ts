import { body, param } from 'express-validator';
import User from '../models/users/user';

// Política de contraseñas: al menos 8 caracteres, una mayúscula, una minúscula, un número
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

// Validación de número de teléfono como expresión regular
const isValidPhoneNumber = /^\+?[1-9]\d{1,14}$/;

export const loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria')
];

export const createUserValidator = [
  body('fullName').notEmpty().withMessage('El nombre completo es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .matches(passwordPolicy)
    .withMessage('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número'),
  body('gender').isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género inválido'),
  body('birthDate').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('El número de teléfono es obligatorio')
    .custom((value) => isValidPhoneNumber.test(value))
    .withMessage('El número de teléfono no es válido'),
  body('profilePicture').optional().isURL().withMessage('La URL de la imagen no es válida')
];

export const registerValidator = [
  // Campos personales básicos
  body('fullName').notEmpty().withMessage('El nombre completo es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .matches(passwordPolicy)
    .withMessage('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('El número de teléfono es obligatorio')
    .custom((value) => isValidPhoneNumber.test(value))
    .withMessage('El número de teléfono no es válido'),
  body('gender').isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género inválido'),
  body('birthDate').isISO8601().withMessage('Fecha de nacimiento inválida'),
  
  // Datos de salud
  body('health.altura')
    .isFloat({ min: 100, max: 250 })
    .withMessage('La altura debe estar entre 100 y 250 cm'),
  body('health.pesoActual')
    .isFloat({ min: 30, max: 300 })
    .withMessage('El peso actual debe estar entre 30 y 300 kg'),
  body('health.objetivoPeso')
    .isFloat({ min: 30, max: 300 })
    .withMessage('El peso objetivo debe estar entre 30 y 300 kg'),
  body('health.condicionesMedicas')
    .optional()
    .isArray()
    .withMessage('Las condiciones médicas deben ser un array'),
  body('health.restriccionesDieteticas')
    .optional()
    .isArray()
    .withMessage('Las restricciones dietéticas deben ser un array'),
  body('health.alergiasIntolerancias')
    .optional()
    .isArray()
    .withMessage('Las alergias e intolerancias deben ser un array'),
  body('health.preferenciasAlimentarias')
    .optional()
    .isArray()
    .withMessage('Las preferencias alimentarias deben ser un array'),
  body('health.comidasDia')
    .notEmpty()
    .withMessage('El número de comidas al día es obligatorio'),
  
  // Datos de actividad física
  body('activity.nivelActividad')
    .isIn(['Sedentario', 'Ocasional', 'Regular', 'Frecuente', 'Diario'])
    .withMessage('Nivel de actividad inválido'),
  body('activity.frecuenciaEjercicio')
    .isInt({ min: 0, max: 7 })
    .withMessage('La frecuencia de ejercicio debe estar entre 0 y 7 días'),
  body('activity.tipoEjercicio')
    .isArray()
    .notEmpty()
    .withMessage('Debe seleccionar al menos un tipo de ejercicio')
    .custom((value) => {
      const validTypes = ['Cardio', 'Musculación', 'Deportes de equipo', 'Yoga/Pilates', 'Natación', 'Ciclismo', 'Running', 'Otros'];
      return value.every((type: string) => validTypes.includes(type));
    })
    .withMessage('Tipo de ejercicio inválido'),
  body('activity.objetivo')
    .isIn(['Pérdida de peso', 'Ganancia muscular', 'Resistencia', 'Flexibilidad', 'Salud general', 'Rehabilitación'])
    .withMessage('Objetivo inválido'),
  body('activity.preferenciasEjercicios')
    .optional()
    .isArray()
    .withMessage('Las preferencias de ejercicio deben ser un array')
];

// Validadores por pasos
export const step0Validator = [
  body('fullName').notEmpty().withMessage('El nombre completo es obligatorio'),
  body('email')
    .isEmail().withMessage('Email inválido')
    .custom(async (value) => {
      try {
        const existingUser = await User.findOne({ email: value.toLowerCase() });
        if (existingUser) {
          throw new Error('El email ya está registrado');
        }
        return true;
      } catch (error) {
        if (error instanceof Error && error.message === 'El email ya está registrado') {
          throw error;
        }
        // Si hay un error de base de datos, permitir que continúe
        return true;
      }
    }).withMessage('El email ya está registrado'),
  body('password')
    .matches(passwordPolicy)
    .withMessage('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('El número de teléfono es obligatorio')
    .custom((value) => isValidPhoneNumber.test(value))
    .withMessage('El número de teléfono no es válido'),
  body('gender').isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género inválido'),
  body('birthDate').isISO8601().withMessage('Fecha de nacimiento inválida')
];

export const step1Validator = [
  ...step0Validator,
  body('health.altura')
    .isFloat({ min: 100, max: 250 })
    .withMessage('La altura debe estar entre 100 y 250 cm'),
  body('health.pesoActual')
    .isFloat({ min: 30, max: 300 })
    .withMessage('El peso actual debe estar entre 30 y 300 kg'),
  body('health.objetivoPeso')
    .isFloat({ min: 30, max: 300 })
    .withMessage('El peso objetivo debe estar entre 30 y 300 kg'),
  body('health.condicionesMedicas')
    .optional()
    .isArray()
    .withMessage('Las condiciones médicas deben ser un array')
];

export const step2Validator = [
  ...step1Validator,
  body('activity.nivelActividad')
    .isIn(['Sedentario', 'Ocasional', 'Regular', 'Frecuente', 'Diario'])
    .withMessage('Nivel de actividad inválido'),
  body('activity.frecuenciaEjercicio')
    .notEmpty()
    .isInt({ min: 0, max: 7 })
    .withMessage('La frecuencia de ejercicio debe estar entre 0 y 7 días')
];

export const step3Validator = [
  ...step2Validator,
  body('activity.tipoEjercicio')
    .isArray()
    .notEmpty()
    .withMessage('Debe seleccionar al menos un tipo de ejercicio')
    .custom((value) => {
      const validTypes = ['Cardio', 'Musculación', 'Deportes de equipo', 'Yoga/Pilates', 'Natación', 'Ciclismo', 'Running', 'Otros'];
      return value.every((type: string) => validTypes.includes(type));
    })
    .withMessage('Tipo de ejercicio inválido'),
  body('activity.otrosEjercicios')
    .optional()
    .isString()
    .withMessage('Los otros ejercicios deben ser un string'),
  body('activity.disponibilidad')
    .notEmpty()
    .withMessage('La disponibilidad es obligatoria'),
  body('activity.objetivo')
    .isIn(['Pérdida de peso', 'Ganancia muscular', 'Resistencia', 'Flexibilidad', 'Salud general', 'Rehabilitación'])
    .withMessage('Objetivo inválido')
];

export const step4Validator = [
  ...step3Validator,
  body('health.restriccionesDieteticas')
    .optional()
    .isArray()
    .withMessage('Las restricciones dietéticas deben ser un array'),
  body('health.alergiasIntolerancias')
    .optional()
    .isArray()
    .withMessage('Las alergias e intolerancias deben ser un array'),
  body('health.preferenciasAlimentarias')
    .optional()
    .isArray()
    .withMessage('Las preferencias alimentarias deben ser obligatorias'),
  body('health.comidasDia')
    .notEmpty()
    .withMessage('El número de comidas al día es obligatorio'),
  body('health.horariosComidas')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un horario de comida'),
  body('health.horariosComidas.*.comida')
    .isIn(['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Snack'])
    .withMessage('Tipo de comida inválido'),
  body('health.horariosComidas.*.hora')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido. Use HH:MM'),
  body('health.horariosComidas')
    .custom((value, { req }) => {
      const comidasDia = req.body.health?.comidasDia;
      if (comidasDia && value.length !== comidasDia) {
        throw new Error(`Debe especificar exactamente ${comidasDia} horario(s) de comida`);
      }
      return true;
    })
    .withMessage('El número de horarios debe coincidir con el número de comidas al día')
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('ID inválido'),
  body('fullName').optional().notEmpty().withMessage('El nombre completo no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('password')
    .optional()
    .matches(passwordPolicy)
    .withMessage('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número'),
  body('gender').optional().isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género inválido'),
  body('birthDate').optional().isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('phoneNumber')
    .optional()
    .custom((value) => isValidPhoneNumber.test(value))
    .withMessage('El número de teléfono no es válido'),
  body('profilePicture').optional().isURL().withMessage('La URL de la imagen no es válida')
];