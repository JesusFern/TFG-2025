// Constantes compartidas para el módulo de entrenamiento

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const DIAS_SEMANA_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export const OBJETIVOS_ENTRENAMIENTO = [
  'Pérdida de peso',
  'Ganancia muscular',
  'Mantenimiento',
  'Resistencia',
  'Flexibilidad',
  'Potencia',
  'Estabilidad',
  'Salud general'
];

export const BREADCRUMBS_TRAINING_BASE = [
  { title: 'Inicio', href: '/', icon: undefined },
  { title: 'Entrenamiento', href: '/training/planes' }
];

export const BREADCRUMBS_DIET_BASE = [
  { title: 'Inicio', href: '/', icon: undefined },
  { title: 'Clientes', href: '/clientes' }
];

export const OPCIONES_PROGRESION_DEFAULT = {
  aumentarPeso: true,
  masRepeticiones: true,
  mayorIntensidad: false
};
