import { body, param, query } from 'express-validator';
import { validateRequest } from '../middlewares/validationMiddleware';

// Validators para mensajes
export const validarCrearMensaje = [
  body('destinatario')
    .isMongoId()
    .withMessage('ID de destinatario inválido'),
  
  body('contenido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido debe tener entre 1 y 5000 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['texto', 'imagen', 'archivo', 'sistema'])
    .withMessage('Tipo de mensaje inválido'),
  
  body('prioridad')
    .optional()
    .isIn(['baja', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  
  body('categoria')
    .optional()
    .isIn(['general', 'entrenamiento', 'nutricion', 'consulta', 'recordatorio'])
    .withMessage('Categoría inválida'),
  
  body('adjuntos')
    .optional()
    .isArray()
    .withMessage('Los adjuntos deben ser un array'),
  
  body('adjuntos.*.nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre de adjunto inválido'),
  
  body('adjuntos.*.url')
    .optional()
    .isURL()
    .withMessage('URL de adjunto inválida'),
  
  body('adjuntos.*.tipo')
    .optional()
    .isString()
    .withMessage('Tipo de adjunto inválido'),
  
  body('adjuntos.*.tamano')
    .optional()
    .isInt({ min: 1, max: 10485760 }) // 10MB máximo
    .withMessage('Tamaño de adjunto inválido'),
  
  body('programadoPara')
    .optional()
    .isISO8601()
    .withMessage('Fecha de programación inválida'),
  
  body('expiraEn')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración inválida'),
  
  validateRequest
];

export const validarObtenerMensajes = [
  query('conversacionId')
    .optional()
    .isMongoId()
    .withMessage('ID de conversación inválido'),
  
  query('remitente')
    .optional()
    .isMongoId()
    .withMessage('ID de remitente inválido'),
  
  query('destinatario')
    .optional()
    .isMongoId()
    .withMessage('ID de destinatario inválido'),
  
  query('estado')
    .optional()
    .isIn(['enviado', 'entregado', 'leido', 'archivado'])
    .withMessage('Estado inválido'),
  
  query('categoria')
    .optional()
    .isIn(['general', 'entrenamiento', 'nutricion', 'consulta', 'recordatorio'])
    .withMessage('Categoría inválida'),
  
  query('prioridad')
    .optional()
    .isIn(['baja', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser un número positivo'),
  
  validateRequest
];

export const validarMensajeId = [
  param('id')
    .isMongoId()
    .withMessage('ID de mensaje inválido'),
  
  validateRequest
];

export const validarMarcarComoLeido = [
  param('id')
    .isMongoId()
    .withMessage('ID de mensaje inválido'),
  
  validateRequest
];

// Validators para conversaciones
export const validarCrearConversacion = [
  body('participantes')
    .isArray({ min: 1, max: 10 }) // Cambiado de 2 a 1 porque el usuario actual se agrega automáticamente
    .withMessage('Debe haber entre 1 y 10 participantes'),
  
  body('participantes.*')
    .isMongoId()
    .withMessage('ID de participante inválido'),
  
  body('metadata.tipo')
    .optional()
    .isIn(['general', 'entrenamiento', 'nutricion', 'consulta'])
    .withMessage('Tipo de conversación inválido'),
  
  body('metadata.planEntrenamiento')
    .optional()
    .isMongoId()
    .withMessage('ID de plan de entrenamiento inválido'),
  
  body('metadata.dieta')
    .optional()
    .isMongoId()
    .withMessage('ID de dieta inválida'),
  
  body('metadata.tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('metadata.tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag inválido'),
  
  body('configuracion.notificaciones')
    .optional()
    .isBoolean()
    .withMessage('Configuración de notificaciones inválida'),
  
  body('configuracion.sonido')
    .optional()
    .isBoolean()
    .withMessage('Configuración de sonido inválida'),
  
  body('configuracion.recordatorios')
    .optional()
    .isBoolean()
    .withMessage('Configuración de recordatorios inválida'),
  
  validateRequest
];

export const validarObtenerConversaciones = [
  query('participante')
    .optional()
    .isMongoId()
    .withMessage('ID de participante inválido'),
  
  query('tipo')
    .optional()
    .isIn(['general', 'entrenamiento', 'nutricion', 'consulta'])
    .withMessage('Tipo de conversación inválido'),
  
  query('activa')
    .optional()
    .isBoolean()
    .withMessage('Estado activo inválido'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser un número positivo'),
  
  validateRequest
];

export const validarConversacionId = [
  param('id')
    .isMongoId()
    .withMessage('ID de conversación inválido'),
  
  validateRequest
];

export const validarActualizarConversacion = [
  param('id')
    .isMongoId()
    .withMessage('ID de conversación inválido'),
  
  body('activa')
    .optional()
    .isBoolean()
    .withMessage('Estado activo inválido'),
  
  body('metadata.tipo')
    .optional()
    .isIn(['general', 'entrenamiento', 'nutricion', 'consulta'])
    .withMessage('Tipo de conversación inválido'),
  
  body('configuracion.notificaciones')
    .optional()
    .isBoolean()
    .withMessage('Configuración de notificaciones inválida'),
  
  validateRequest
];

// Validators para notificaciones
export const validarObtenerNotificaciones = [
  query('tipo')
    .optional()
    .isIn(['mensaje', 'recordatorio', 'sistema', 'entrenamiento', 'nutricion'])
    .withMessage('Tipo de notificación inválido'),
  
  query('leida')
    .optional()
    .isBoolean()
    .withMessage('Estado de lectura inválido'),
  
  query('prioridad')
    .optional()
    .isIn(['baja', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser un número positivo'),
  
  validateRequest
];

export const validarNotificacionId = [
  param('id')
    .isMongoId()
    .withMessage('ID de notificación inválido'),
  
  validateRequest
];

export const validarMarcarNotificacionComoLeida = [
  param('id')
    .isMongoId()
    .withMessage('ID de notificación inválido'),
  
  validateRequest
];
