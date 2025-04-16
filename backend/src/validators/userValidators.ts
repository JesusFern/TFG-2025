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