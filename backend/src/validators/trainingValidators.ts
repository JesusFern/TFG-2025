import { body, param, query } from 'express-validator';

// Validadores para ejercicios
export const crearEjercicioValidator = [
  body('nombre').isString().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es obligatorio y debe tener entre 1 y 100 caracteres'),
  body('slug').isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('El slug es obligatorio, debe tener entre 1 y 100 caracteres y solo contener letras minúsculas, números y guiones'),
  body('descripcion').optional().isString().trim().isLength({ min: 0, max: 500 }).withMessage('La descripción debe tener entre 0 y 500 caracteres'),
  body('grupoMuscular').isIn(['Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas']).withMessage('Grupo muscular no válido'),
  body('equipamiento').isIn(['Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia', 'Barra de dominadas', 'Banco', 'Cable', 'Kettlebell']).withMessage('Equipamiento no válido'),
  body('nivelDificultad').isIn(['Principiante', 'Intermedio', 'Avanzado']).withMessage('Nivel de dificultad no válido'),
  body('arquetipo').optional().isBoolean().toBoolean().withMessage('El campo arquetipo debe ser un booleano'),
  body('creador').optional().isMongoId().withMessage('ID de creador no válido'),
  body('activo').optional().isBoolean().toBoolean().withMessage('El campo activo debe ser un booleano'),
  body('tipoEjercicio').isIn(['Fuerza', 'Cardio', 'Flexibilidad', 'HIIT', 'Resistencia', 'Potencia', 'Estabilidad']).withMessage('Tipo de ejercicio no válido'),
  body('instrucciones').optional().isString().trim().isLength({ min: 0, max: 1000 }).withMessage('Las instrucciones deben tener entre 0 y 1000 caracteres'),
  body('videoDemostrativo').optional().isURL().withMessage('El video demostrativo debe ser una URL válida'),
  body('publico').optional().isBoolean().toBoolean().withMessage('El campo público debe ser un booleano')
];

export const actualizarEjercicioValidator = [
  param('id').isMongoId().withMessage('ID de ejercicio no válido'),
  body('nombre').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('El slug debe tener entre 1 y 100 caracteres y solo contener letras minúsculas, números y guiones'),
  body('descripcion').optional().isString().trim().isLength({ min: 0, max: 500 }).withMessage('La descripción debe tener entre 0 y 500 caracteres'),
  body('grupoMuscular').optional().isIn(['Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas']).withMessage('Grupo muscular no válido'),
  body('equipamiento').optional().isIn(['Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia', 'Barra de dominadas', 'Banco', 'Cable', 'Kettlebell']).withMessage('Equipamiento no válido'),
  body('nivelDificultad').optional().isIn(['Principiante', 'Intermedio', 'Avanzado']).withMessage('Nivel de dificultad no válido'),
  body('arquetipo').optional().isBoolean().toBoolean().withMessage('El campo arquetipo debe ser un booleano'),
  body('creador').optional().isMongoId().withMessage('ID de creador no válido'),
  body('activo').optional().isBoolean().toBoolean().withMessage('El campo activo debe ser un booleano'),
  body('tipoEjercicio').optional().isIn(['Fuerza', 'Cardio', 'Flexibilidad', 'HIIT', 'Resistencia', 'Potencia', 'Estabilidad']).withMessage('Tipo de ejercicio no válido'),
  body('instrucciones').optional().isString().trim().isLength({ min: 0, max: 1000 }).withMessage('Las instrucciones deben tener entre 0 y 1000 caracteres'),
  body('videoDemostrativo').optional().isURL().withMessage('El video demostrativo debe ser una URL válida'),
  body('publico').optional().isBoolean().toBoolean().withMessage('El campo público debe ser un booleano')
];

// Validadores para planes de entrenamiento
export const crearPlanEntrenamientoValidator = [
  body('nombre').isString().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es obligatorio y debe tener entre 1 y 100 caracteres'),
  body('descripcion').optional().isString().trim().isLength({ max: 1000 }).withMessage('La descripción debe tener máximo 1000 caracteres'),
  body('objetivo').isIn(['Pérdida de peso', 'Ganancia muscular', 'Mantenimiento', 'Resistencia', 'Flexibilidad', 'Potencia', 'Estabilidad', 'Salud general']).withMessage('Objetivo no válido'),
  body('duracionDias').isInt({ min: 1, max: 365 }).toInt().withMessage('La duración debe ser un número entero entre 1 y 365 días'),
  body('sesionesPorSemana').isInt({ min: 1, max: 7 }).toInt().withMessage('Las sesiones por semana deben ser un número entero entre 1 y 7'),
  body('fechaInicio').isISO8601().withMessage('La fecha de inicio debe ser una fecha válida'),
  body('diasSemana').isArray({ min: 1, max: 7 }).withMessage('Debe seleccionar entre 1 y 7 días de la semana'),
  body('diasSemana.*').isInt({ min: 0, max: 6 }).toInt().withMessage('Cada día debe ser un número entre 0 (Domingo) y 6 (Sábado)'),
  body('clientes').isArray({ min: 0 }).withMessage('Los clientes deben ser un array'),
  body('clientes.*').isMongoId().withMessage('Cada cliente debe tener un ID válido'),
  body('publico').isBoolean().toBoolean().withMessage('El campo público debe ser un booleano')
];

export const actualizarPlanEntrenamientoValidator = [
  param('id').isMongoId().withMessage('ID de plan no válido'),
  body('nombre').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  body('descripcion').optional().isString().trim().isLength({ max: 1000 }).withMessage('La descripción debe tener máximo 1000 caracteres'),
  body('objetivo').optional().isIn(['Pérdida de peso', 'Ganancia muscular', 'Mantenimiento', 'Resistencia', 'Flexibilidad', 'Potencia', 'Estabilidad', 'Salud general']).withMessage('Objetivo no válido'),
  body('duracionDias').optional().isInt({ min: 1, max: 365 }).toInt().withMessage('La duración debe ser un número entero entre 1 y 365 días'),
  body('sesionesPorSemana').optional().isInt({ min: 1, max: 7 }).toInt().withMessage('Las sesiones por semana deben ser un número entero entre 1 y 7'),
  body('fechaInicio').optional().isISO8601().withMessage('La fecha de inicio debe ser una fecha válida'),
  body('diasSemana').optional().isArray({ min: 1, max: 7 }).withMessage('Debe seleccionar entre 1 y 7 días de la semana'),
  body('diasSemana.*').optional().isInt({ min: 0, max: 6 }).toInt().withMessage('Cada día debe ser un número entre 0 (Domingo) y 6 (Sábado)'),
  body('clientes').optional().isArray({ min: 0 }).withMessage('Los clientes deben ser un array'),
  body('clientes.*').optional().isMongoId().withMessage('Cada cliente debe tener un ID válido'),
  body('publico').optional().isBoolean().toBoolean().withMessage('El campo público debe ser un booleano')
];

// Validadores para sesiones
export const crearSesionValidator = [
  body('clienteId').isMongoId().withMessage('ID de cliente no válido'),
  body('planId').optional().isMongoId().withMessage('ID de plan no válido'),
  body('fecha').isISO8601().withMessage('La fecha debe ser una fecha válida'),
  body('hora').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM'),
  body('tipoEntrenamiento').isIn(['Fuerza', 'Resistencia', 'Cardio', 'HIIT', 'Movilidad', 'Flexibilidad', 'Potencia', 'Estabilidad']).withMessage('Tipo de entrenamiento no válido'),
  body('duracion').isInt({ min: 1, max: 480 }).toInt().withMessage('La duración debe ser un número entero entre 1 y 480 minutos'),
  body('ejercicios').isArray({ min: 0 }).withMessage('Los ejercicios deben ser un array'),
  body('ejercicios.*.ejercicio').isMongoId().withMessage('Cada ejercicio debe tener un ID válido'),
  body('ejercicios.*.orden').isInt({ min: 1 }).toInt().withMessage('El orden debe ser un número entero mayor que 0'),
  body('ejercicios.*.series').isInt({ min: 1, max: 20 }).toInt().withMessage('Las series deben ser un número entero entre 1 y 20'),
  body('ejercicios.*.repeticiones').isInt({ min: 1, max: 100 }).toInt().withMessage('Las repeticiones deben ser un número entero entre 1 y 100'),
  body('ejercicios.*.peso').optional().isFloat({ min: 0 }).toFloat().withMessage('El peso debe ser un número positivo'),
  body('ejercicios.*.tiempoDescanso').isInt({ min: 0, max: 600 }).toInt().withMessage('El tiempo de descanso debe ser un número entero entre 0 y 600 segundos'),
  body('ejercicios.*.nivelIntensidad').isIn(['Baja', 'Media', 'Alta']).withMessage('Nivel de intensidad no válido'),
  body('ejercicios.*.ejerciciosAlternativos').optional().isArray().withMessage('Los ejercicios alternativos deben ser un array'),
  body('ejercicios.*.ejerciciosAlternativos.*').optional().isMongoId().withMessage('Cada ejercicio alternativo debe tener un ID válido'),
  body('ejercicios.*.opcionesProgresion.aumentarPeso').optional().isBoolean().toBoolean().withMessage('Aumentar peso debe ser un booleano'),
  body('ejercicios.*.opcionesProgresion.masRepeticiones').optional().isBoolean().toBoolean().withMessage('Más repeticiones debe ser un booleano'),
  body('ejercicios.*.opcionesProgresion.mayorIntensidad').optional().isBoolean().toBoolean().withMessage('Mayor intensidad debe ser un booleano')
];

export const actualizarSesionValidator = [
  param('id').isMongoId().withMessage('ID de sesión no válido'),
  body('fecha').optional().isISO8601().withMessage('La fecha debe ser una fecha válida'),
  body('hora').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM'),
  body('tipoEntrenamiento').optional().isIn(['Fuerza', 'Resistencia', 'Cardio', 'HIIT', 'Movilidad', 'Flexibilidad', 'Potencia', 'Estabilidad']).withMessage('Tipo de entrenamiento no válido'),
  body('duracion').optional().isInt({ min: 1, max: 480 }).toInt().withMessage('La duración debe ser un número entero entre 1 y 480 minutos'),
  body('ejercicios').optional().isArray({ min: 0 }).withMessage('Los ejercicios deben ser un array'),
  body('ejercicios.*.ejercicio').optional().isMongoId().withMessage('Cada ejercicio debe tener un ID válido'),
  body('ejercicios.*.orden').optional().isInt({ min: 1 }).toInt().withMessage('El orden debe ser un número entero mayor que 0'),
  body('ejercicios.*.series').optional().isInt({ min: 1, max: 20 }).toInt().withMessage('Las series deben ser un número entero entre 1 y 20'),
  body('ejercicios.*.repeticiones').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Las repeticiones deben ser un número entero entre 1 y 100'),
  body('ejercicios.*.peso').optional().isFloat({ min: 0 }).toFloat().withMessage('El peso debe ser un número positivo'),
  body('ejercicios.*.tiempoDescanso').optional().isInt({ min: 0, max: 600 }).toInt().withMessage('El tiempo de descanso debe ser un número entero entre 0 y 600 segundos'),
  body('ejercicios.*.nivelIntensidad').optional().isIn(['Baja', 'Media', 'Alta']).withMessage('Nivel de intensidad no válido'),
  body('ejercicios.*.ejerciciosAlternativos').optional().isArray().withMessage('Los ejercicios alternativos deben ser un array'),
  body('ejercicios.*.ejerciciosAlternativos.*').optional().isMongoId().withMessage('Cada ejercicio alternativo debe tener un ID válido'),
  body('ejercicios.*.opcionesProgresion.aumentarPeso').optional().isBoolean().toBoolean().withMessage('Aumentar peso debe ser un booleano'),
  body('ejercicios.*.opcionesProgresion.masRepeticiones').optional().isBoolean().toBoolean().withMessage('Más repeticiones debe ser un booleano'),
  body('ejercicios.*.opcionesProgresion.mayorIntensidad').optional().isBoolean().toBoolean().withMessage('Mayor intensidad debe ser un booleano'),
  body('notas').optional().isString().trim().isLength({ max: 1000 }).withMessage('Las notas deben tener máximo 1000 caracteres')
];

// Validadores para parámetros de consulta
export const filtrosEjerciciosValidator = [
  query('grupoMuscular').optional().isIn(['Piernas', 'Espalda', 'Pecho', 'Hombros', 'Brazos', 'Core', 'Glúteos', 'Pantorrillas']).withMessage('Grupo muscular no válido'),
  query('nivelDificultad').optional().isIn(['Principiante', 'Intermedio', 'Avanzado']).withMessage('Nivel de dificultad no válido'),
  query('equipamiento').optional().isIn(['Mancuernas', 'Barra', 'Cuerda para saltar', 'Ninguno', 'Máquina', 'Peso corporal', 'Pelota medicinal', 'Bandas de resistencia', 'Barra de dominadas', 'Banco', 'Cable', 'Kettlebell']).withMessage('Equipamiento no válido'),
  query('tipoEjercicio').optional().isIn(['Fuerza', 'Cardio', 'Flexibilidad', 'HIIT', 'Resistencia', 'Potencia', 'Estabilidad']).withMessage('Tipo de ejercicio no válido'),
  query('creador').optional().isMongoId().withMessage('ID de creador no válido'),
  query('publico').optional().isBoolean().toBoolean().withMessage('El campo público debe ser un booleano'),
  query('arquetipo').optional().isBoolean().toBoolean().withMessage('El campo arquetipo debe ser un booleano')
];

export const filtrosPlanesValidator = [
  query('entrenador').optional().isMongoId().withMessage('ID de entrenador no válido'),
  query('cliente').optional().isMongoId().withMessage('ID de cliente no válido'),
  query('objetivo').optional().isIn(['Pérdida de peso', 'Ganancia muscular', 'Mantenimiento', 'Resistencia', 'Flexibilidad', 'Potencia', 'Estabilidad', 'Salud general']).withMessage('Objetivo no válido'),
  query('publico').optional().isBoolean().toBoolean().withMessage('El campo público debe ser un booleano'),
  query('activo').optional().isBoolean().toBoolean().withMessage('El campo activo debe ser un booleano')
];

export const filtrosSesionesValidator = [
  query('entrenador').optional().isMongoId().withMessage('ID de entrenador no válido'),
  query('cliente').optional().isMongoId().withMessage('ID de cliente no válido'),
  query('plan').optional().isMongoId().withMessage('ID de plan no válido'),
  query('fecha').optional().isISO8601().withMessage('La fecha debe ser una fecha válida'),
  query('tipoEntrenamiento').optional().isIn(['Fuerza', 'Resistencia', 'Cardio', 'HIIT', 'Movilidad', 'Flexibilidad', 'Potencia', 'Estabilidad']).withMessage('Tipo de entrenamiento no válido'),
  query('completada').optional().isBoolean().toBoolean().withMessage('El campo completada debe ser un booleano')
];

// Validadores para parámetros de ruta
export const idValidator = [
  param('id').isMongoId().withMessage('ID no válido')
];

export const slugValidator = [
  param('slug').isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Slug no válido')
];

export const asignarClienteValidator = [
  param('id').isMongoId().withMessage('ID de plan no válido'),
  body('clienteId').isMongoId().withMessage('ID de cliente no válido')
];

export const removerClienteValidator = [
  param('id').isMongoId().withMessage('ID de plan no válido'),
  param('clienteId').isMongoId().withMessage('ID de cliente no válido')
];

export const marcarSesionCompletadaValidator = [
  param('id').isMongoId().withMessage('ID de sesión no válido')
];

export const agregarNotasSesionValidator = [
  param('id').isMongoId().withMessage('ID de sesión no válido'),
  body('notas').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Las notas son obligatorias y deben tener entre 1 y 1000 caracteres')
];

// Validadores para registro de ejercicios
export const crearRegistroEjercicioValidator = [
  body('ejercicio').isMongoId().withMessage('ID de ejercicio no válido'),
  body('sesion').isMongoId().withMessage('ID de sesión no válido'),
  body('cargaUtilizada').optional().isFloat({ min: 0 }).toFloat().withMessage('La carga utilizada debe ser un número positivo'),
  body('repeticionesRealizadas').isInt({ min: 0, max: 1000 }).toInt().withMessage('Las repeticiones realizadas deben ser un número entero entre 0 y 1000'),
  body('seriesCompletadas').isInt({ min: 0, max: 100 }).toInt().withMessage('Las series completadas deben ser un número entero entre 0 y 100'),
  body('nivelEsfuerzo').isInt({ min: 1, max: 10 }).toInt().withMessage('El nivel de esfuerzo debe ser un número entero entre 1 y 10'),
  body('videoCliente').optional().isString().trim().isLength({ max: 500 }).withMessage('El video del cliente debe tener máximo 500 caracteres'),
  body('notas').optional().isString().trim().isLength({ max: 1000 }).withMessage('Las notas deben tener máximo 1000 caracteres'),
  body('tiempoDescanso').optional().isInt({ min: 0, max: 3600 }).toInt().withMessage('El tiempo de descanso debe ser un número entero entre 0 y 3600 segundos'),
  body('duracionEjercicio').optional().isInt({ min: 0, max: 7200 }).toInt().withMessage('La duración del ejercicio debe ser un número entero entre 0 y 7200 segundos'),
  body('ordenEnSesion').optional().isInt({ min: 1 }).toInt().withMessage('El orden en la sesión debe ser un número entero mayor que 0'),
  body('completado').optional().isBoolean().toBoolean().withMessage('El campo completado debe ser un booleano')
];

export const actualizarRegistroEjercicioValidator = [
  param('id').isMongoId().withMessage('ID de registro no válido'),
  body('cargaUtilizada').optional().isFloat({ min: 0 }).toFloat().withMessage('La carga utilizada debe ser un número positivo'),
  body('repeticionesRealizadas').optional().isInt({ min: 0, max: 1000 }).toInt().withMessage('Las repeticiones realizadas deben ser un número entero entre 0 y 1000'),
  body('seriesCompletadas').optional().isInt({ min: 0, max: 100 }).toInt().withMessage('Las series completadas deben ser un número entero entre 0 y 100'),
  body('nivelEsfuerzo').optional().isInt({ min: 1, max: 10 }).toInt().withMessage('El nivel de esfuerzo debe ser un número entero entre 1 y 10'),
  body('videoCliente').optional().isString().trim().isLength({ max: 500 }).withMessage('El video del cliente debe tener máximo 500 caracteres'),
  body('notas').optional().isString().trim().isLength({ max: 1000 }).withMessage('Las notas deben tener máximo 1000 caracteres'),
  body('tiempoDescanso').optional().isInt({ min: 0, max: 3600 }).toInt().withMessage('El tiempo de descanso debe ser un número entero entre 0 y 3600 segundos'),
  body('duracionEjercicio').optional().isInt({ min: 0, max: 7200 }).toInt().withMessage('La duración del ejercicio debe ser un número entero entre 0 y 7200 segundos'),
  body('completado').optional().isBoolean().toBoolean().withMessage('El campo completado debe ser un booleano')
];

export const filtrosRegistroEjercicioValidator = [
  query('sesion').optional().isMongoId().withMessage('ID de sesión no válido'),
  query('cliente').optional().isMongoId().withMessage('ID de cliente no válido'),
  query('ejercicio').optional().isMongoId().withMessage('ID de ejercicio no válido'),
  query('completado').optional().isBoolean().toBoolean().withMessage('El campo completado debe ser un booleano'),
  query('fecha').optional().isISO8601().withMessage('La fecha debe ser una fecha válida'),
  query('fechaDesde').optional().isISO8601().withMessage('La fecha desde debe ser una fecha válida'),
  query('fechaHasta').optional().isISO8601().withMessage('La fecha hasta debe ser una fecha válida')
];

export const marcarRegistroCompletadoValidator = [
  param('id').isMongoId().withMessage('ID de registro no válido')
];

// Validadores para progreso y verificación
export const ejercicioIdValidator = [
  param('ejercicioId').isMongoId().withMessage('ID de ejercicio no válido')
];

export const sesionIdValidator = [
  param('sesionId').isMongoId().withMessage('ID de sesión no válido')
];
