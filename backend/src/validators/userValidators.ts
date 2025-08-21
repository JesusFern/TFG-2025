import { body, param } from 'express-validator';

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
    .withMessage('El peso objetivo debe estar entre 30 y 300 kg')
];

export const step2Validator = [
  ...step1Validator,
  body('activity.nivelActividad')
    .isIn(['Sedentario', 'Ocasional', 'Regular', 'Frecuente', 'Diario'])
    .withMessage('Nivel de actividad inválido'),
  body('activity.frecuenciaEjercicio')
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
  body('activity.objetivo')
    .isIn(['Pérdida de peso', 'Ganancia muscular', 'Resistencia', 'Flexibilidad', 'Salud general', 'Rehabilitación'])
    .withMessage('Objetivo inválido')
];

export const step4Validator = [
  ...step3Validator,
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
  body('activity.preferenciasEjercicios')
    .optional()
    .isArray()
    .withMessage('Las preferencias de ejercicio deben ser un array')
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