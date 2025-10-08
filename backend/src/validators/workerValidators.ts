import { body } from 'express-validator';

export const validateWorkerRegistration = [
  // Campos básicos obligatorios
  body('fullName')
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre completo debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre completo solo puede contener letras y espacios'),

  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),

  body('phoneNumber')
    .matches(/^[+]?[0-9\s\-()]{7,20}$/)
    .withMessage('Debe proporcionar un número de teléfono válido (mínimo 7 dígitos, máximo 20 caracteres)'),

  // Campos específicos de trabajador
  body('workerType')
    .notEmpty()
    .withMessage('El tipo de trabajador es obligatorio')
    .isIn(['Entrenador personal', 'Nutricionista', 'Nutricionista y Entrenador personal'])
    .withMessage('El tipo de trabajador debe ser: Entrenador personal, Nutricionista, o Nutricionista y Entrenador personal'),

  body('biography')
    .notEmpty()
    .withMessage('La biografía es obligatoria')
    .isLength({ max: 1000 })
    .withMessage('La biografía no puede exceder los 1000 caracteres'),

  body('availability')
    .notEmpty()
    .withMessage('La disponibilidad es obligatoria')
    .isLength({ max: 500 })
    .withMessage('La disponibilidad no puede exceder los 500 caracteres'),

  // Campos opcionales
  body('gender')
    .notEmpty()
    .withMessage('El género es obligatorio')
    .isIn(['Masculino', 'Femenino', 'Otro'])
    .withMessage('El género debe ser: Masculino, Femenino, u Otro'),

  body('birthDate')
    .notEmpty()
    .withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser una fecha válida')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        throw new Error('El trabajador debe ser mayor de 18 años');
      }
      
      if (age > 65) {
        throw new Error('El trabajador no puede ser mayor de 65 años');
      }
      
      return true;
    }),

  body('profilePicture')
    .optional()
    .isString()
    .withMessage('La imagen de perfil debe ser una cadena de texto válida'),

  body('isWorkerAvailable')
    .optional()
    .isBoolean()
    .withMessage('La disponibilidad debe ser un valor booleano')
];
