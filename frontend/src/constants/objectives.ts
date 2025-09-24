export interface ObjetivoEntrenamiento {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  beneficios: string[];
}

export const OBJETIVOS_ENTRENAMIENTO: ObjetivoEntrenamiento[] = [
  {
    nombre: 'Ganancia muscular',
    descripcion: 'Desarrolla masa muscular y fuerza con ejercicios específicos',
    icono: '💪',
    color: 'red',
    beneficios: ['Hipertrofia muscular', 'Aumento de fuerza', 'Mejora de composición corporal']
  },
  {
    nombre: 'Pérdida de peso',
    descripcion: 'Quema grasa y mejora la condición física general',
    icono: '🔥',
    color: 'orange',
    beneficios: ['Quema de grasa', 'Mejora cardiovascular', 'Aumento de metabolismo']
  },
  {
    nombre: 'Resistencia',
    descripcion: 'Mejora la capacidad cardiovascular y la resistencia',
    icono: '🏃',
    color: 'blue',
    beneficios: ['Mejora cardiovascular', 'Aumento de resistencia', 'Mejor condición física']
  },
  {
    nombre: 'Flexibilidad',
    descripcion: 'Desarrolla movilidad y flexibilidad muscular',
    icono: '🧘',
    color: 'grape',
    beneficios: ['Mejor movilidad', 'Reducción de lesiones', 'Relajación muscular']
  },
  {
    nombre: 'Potencia',
    descripcion: 'Desarrolla explosividad y velocidad en movimientos',
    icono: '⚡',
    color: 'yellow',
    beneficios: ['Mejora de explosividad', 'Aumento de velocidad', 'Desarrollo de potencia']
  },
  {
    nombre: 'Estabilidad',
    descripcion: 'Fortalece el core y mejora el equilibrio corporal',
    icono: '⚖️',
    color: 'teal',
    beneficios: ['Fortalecimiento del core', 'Mejor equilibrio', 'Prevención de lesiones']
  },
  {
    nombre: 'Mantenimiento',
    descripcion: 'Mantén tu condición física actual',
    icono: '🔄',
    color: 'cyan',
    beneficios: ['Mantener forma física', 'Rutina equilibrada', 'Bienestar general']
  },
  {
    nombre: 'Salud general',
    descripcion: 'Mejora tu salud y bienestar general',
    icono: '❤️',
    color: 'green',
    beneficios: ['Mejora de salud', 'Bienestar general', 'Prevención de enfermedades']
  }
];

// Para formularios de registro (versión simplificada)
export const OBJETIVOS_OPCIONES = OBJETIVOS_ENTRENAMIENTO.map(objetivo => ({
  value: objetivo.nombre,
  label: objetivo.nombre
}));
