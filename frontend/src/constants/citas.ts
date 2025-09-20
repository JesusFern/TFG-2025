import { TipoCita, EstadoCita, TipoCitaOption, EstadoCitaOption } from '../types/citas';

// Opciones de tipos de citas
export const TIPOS_CITA: TipoCitaOption[] = [
  {
    value: 'seguimiento',
    label: 'Seguimiento',
    description: 'Seguimiento del progreso y ajustes',
    icon: '📊'
  },
  {
    value: 'consulta_nutricion',
    label: 'Consulta Nutricional',
    description: 'Evaluación y plan nutricional',
    icon: '🥗'
  },
  {
    value: 'consulta_entrenamiento',
    label: 'Consulta de Entrenamiento',
    description: 'Plan de ejercicios y rutinas',
    icon: '💪'
  },
  {
    value: 'evaluacion',
    label: 'Evaluación',
    description: 'Evaluación inicial o de progreso',
    icon: '📋'
  },
  {
    value: 'revision',
    label: 'Revisión',
    description: 'Revisión de planes y ajustes',
    icon: '🔍'
  }
];

// Opciones de estados de citas
export const ESTADOS_CITA: EstadoCitaOption[] = [
  {
    value: 'pendiente',
    label: 'Pendiente',
    color: 'yellow',
    icon: '⏳'
  },
  {
    value: 'confirmada',
    label: 'Confirmada',
    color: 'blue',
    icon: '✅'
  },
  {
    value: 'en_progreso',
    label: 'En Progreso',
    color: 'orange',
    icon: '🔄'
  },
  {
    value: 'completada',
    label: 'Completada',
    color: 'green',
    icon: '✅'
  },
  {
    value: 'cancelada',
    label: 'Cancelada',
    color: 'red',
    icon: '❌'
  },
  {
    value: 'reagendada',
    label: 'Reagendada',
    color: 'gray',
    icon: '🔄'
  }
];

// Configuración de horarios disponibles
export const HORARIOS_CONFIG = {
  HORA_INICIO: 9, // 9:00 AM
  HORA_FIN: 18,   // 6:00 PM
  INTERVALO: 30,  // 30 minutos
  DURACION_DEFAULT: 60, // 60 minutos por defecto
  DURACION_MIN: 15,     // 15 minutos mínimo
  DURACION_MAX: 480     // 8 horas máximo
};

// Límites de fechas
export const FECHAS_LIMITES = {
  DIAS_ANTICIPACION_MIN: 0,    // No se pueden crear citas en el pasado
  MESES_ANTICIPACION_MAX: 3    // Máximo 3 meses en el futuro
};

// Configuración de paginación
export const PAGINACION_CONFIG = {
  LIMIT_DEFAULT: 20,
  LIMIT_MAX: 100,
  OFFSET_DEFAULT: 0
};

// Mensajes de validación
export const VALIDACION_MENSAJES = {
  FECHA_PASADO: 'No se pueden programar citas en fechas pasadas',
  FECHA_FUTURO_MAX: 'No se pueden programar citas más de 3 meses en el futuro',
  HORA_FORMATO: 'Formato de hora inválido. Use HH:MM',
  DURACION_RANGO: 'La duración debe estar entre 15 y 480 minutos',
  MOTIVO_MIN: 'El motivo debe tener al menos 10 caracteres',
  MOTIVO_MAX: 'El motivo no puede exceder 500 caracteres',
  MOTIVO_CANCELACION_MIN: 'El motivo de cancelación debe tener al menos 5 caracteres',
  PROFESIONAL_REQUERIDO: 'Selecciona un profesional',
  TIPO_REQUERIDO: 'Selecciona el tipo de cita',
  FECHA_REQUERIDA: 'Selecciona una fecha',
  HORA_REQUERIDA: 'Selecciona una hora'
};

// Mensajes de éxito
export const MENSAJES_EXITO = {
  CITA_CREADA: 'Cita creada exitosamente',
  CITA_ACTUALIZADA: 'Cita actualizada exitosamente',
  CITA_CANCELADA: 'Cita cancelada exitosamente',
  CITA_REAGENDADA: 'Cita reagendada exitosamente',
  CITA_CONFIRMADA: 'Cita confirmada exitosamente',
  CITA_COMPLETADA: 'Cita completada exitosamente'
};

// Mensajes de error
export const MENSAJES_ERROR = {
  CITA_NO_ENCONTRADA: 'Cita no encontrada',
  SIN_PERMISOS: 'No tienes permisos para realizar esta acción',
  CITA_NO_EDITABLE: 'Esta cita no puede ser editada',
  CITA_NO_CANCELABLE: 'Esta cita no puede ser cancelada',
  CITA_NO_REAGENDABLE: 'Esta cita no puede ser reagendada',
  HORARIO_OCUPADO: 'Ya existe una cita programada en ese horario',
  ERROR_GENERICO: 'Ha ocurrido un error inesperado'
};

// Configuración de colores para estados
export const COLORES_ESTADOS = {
  pendiente: 'yellow',
  confirmada: 'blue',
  en_progreso: 'orange',
  completada: 'green',
  cancelada: 'red',
  reagendada: 'gray'
} as const;

// Configuración de colores para tipos
export const COLORES_TIPOS = {
  seguimiento: 'blue',
  consulta_nutricion: 'green',
  consulta_entrenamiento: 'orange',
  evaluacion: 'purple',
  revision: 'teal'
} as const;

// Utilidades para obtener información de tipos y estados
export const getTipoInfo = (tipo: TipoCita): TipoCitaOption | undefined => {
  return TIPOS_CITA.find(t => t.value === tipo);
};

export const getEstadoInfo = (estado: EstadoCita): EstadoCitaOption | undefined => {
  return ESTADOS_CITA.find(e => e.value === estado);
};

export const getTipoColor = (tipo: TipoCita): string => {
  return COLORES_TIPOS[tipo] || 'gray';
};

export const getEstadoColor = (estado: EstadoCita): string => {
  return COLORES_ESTADOS[estado] || 'gray';
};

// Generar horarios disponibles
export const generarHorariosDisponibles = (): string[] => {
  const horarios: string[] = [];
  for (let hora = HORARIOS_CONFIG.HORA_INICIO; hora < HORARIOS_CONFIG.HORA_FIN; hora++) {
    for (let minuto = 0; minuto < 60; minuto += HORARIOS_CONFIG.INTERVALO) {
      const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horarios.push(horario);
    }
  }
  return horarios;
};

// Validar fecha
export const esFechaValida = (fecha: Date): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaMaxima = new Date();
  fechaMaxima.setMonth(fechaMaxima.getMonth() + FECHAS_LIMITES.MESES_ANTICIPACION_MAX);
  
  return fecha >= hoy && fecha <= fechaMaxima;
};

// Validar hora
export const esHoraValida = (hora: string): boolean => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);
};

// Validar duración
export const esDuracionValida = (duracion: number): boolean => {
  return duracion >= HORARIOS_CONFIG.DURACION_MIN && duracion <= HORARIOS_CONFIG.DURACION_MAX;
};
