export interface ObjetivoEntrenamiento {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  beneficios: string[];
}

// Helper function para crear objetivos de manera más concisa
const crearObjetivo = (
  nombre: string,
  descripcion: string,
  icono: string,
  color: string,
  beneficios: string[]
): ObjetivoEntrenamiento => ({
  nombre,
  descripcion,
  icono,
  color,
  beneficios
});

// Datos de objetivos en formato tabular para evitar duplicación
const objetivosData = [
  ['Ganancia muscular', 'Desarrolla masa muscular y fuerza con ejercicios específicos', '💪', 'red', ['Hipertrofia muscular', 'Aumento de fuerza', 'Mejora de composición corporal']],
  ['Pérdida de peso', 'Quema grasa y mejora la condición física general', '🔥', 'orange', ['Quema de grasa', 'Mejora cardiovascular', 'Aumento de metabolismo']],
  ['Resistencia', 'Mejora la capacidad cardiovascular y la resistencia', '🏃', 'blue', ['Mejora cardiovascular', 'Aumento de resistencia', 'Mejor condición física']],
  ['Flexibilidad', 'Desarrolla movilidad y flexibilidad muscular', '🧘', 'grape', ['Mejor movilidad', 'Reducción de lesiones', 'Relajación muscular']],
  ['Potencia', 'Desarrolla explosividad y velocidad en movimientos', '⚡', 'yellow', ['Mejora de explosividad', 'Aumento de velocidad', 'Desarrollo de potencia']],
  ['Estabilidad', 'Fortalece el core y mejora el equilibrio corporal', '⚖️', 'teal', ['Fortalecimiento del core', 'Mejor equilibrio', 'Prevención de lesiones']],
  ['Mantenimiento', 'Mantén tu condición física actual', '🔄', 'cyan', ['Mantener forma física', 'Rutina equilibrada', 'Bienestar general']],
  ['Salud general', 'Mejora tu salud y bienestar general', '❤️', 'green', ['Mejora de salud', 'Bienestar general', 'Prevención de enfermedades']]
] as const;

export const OBJETIVOS_ENTRENAMIENTO: ObjetivoEntrenamiento[] = objetivosData.map(
  ([nombre, descripcion, icono, color, beneficios]) => 
    crearObjetivo(nombre, descripcion, icono, color, [...beneficios])
);

// Para formularios de registro (versión simplificada)
export const OBJETIVOS_OPCIONES = OBJETIVOS_ENTRENAMIENTO.map(objetivo => ({
  value: objetivo.nombre,
  label: objetivo.nombre
}));
