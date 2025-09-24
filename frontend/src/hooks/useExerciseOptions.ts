import { useMemo } from 'react';

interface ExerciseOptions {
  gruposMusculares: { value: string; label: string }[];
  equipamientos: { value: string; label: string }[];
  nivelesDificultad: { value: string; label: string }[];
  nivelesIntensidad: { value: string; label: string }[];
  tiposEjercicio: { value: string; label: string }[];
}

// Función helper para generar slug a partir del nombre
export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const useExerciseOptions = (): ExerciseOptions => {
  return useMemo(() => ({
    gruposMusculares: [
      { value: 'Piernas', label: 'Piernas' },
      { value: 'Espalda', label: 'Espalda' },
      { value: 'Pecho', label: 'Pecho' },
      { value: 'Hombros', label: 'Hombros' },
      { value: 'Brazos', label: 'Brazos' },
      { value: 'Core', label: 'Core' },
      { value: 'Glúteos', label: 'Glúteos' },
      { value: 'Pantorrillas', label: 'Pantorrillas' }
    ],
    equipamientos: [
      { value: 'Mancuernas', label: 'Mancuernas' },
      { value: 'Barra', label: 'Barra' },
      { value: 'Cuerda para saltar', label: 'Cuerda para saltar' },
      { value: 'Ninguno', label: 'Ninguno' },
      { value: 'Máquina', label: 'Máquina' },
      { value: 'Peso corporal', label: 'Peso corporal' },
      { value: 'Pelota medicinal', label: 'Pelota medicinal' },
      { value: 'Bandas de resistencia', label: 'Bandas de resistencia' },
      { value: 'Barra de dominadas', label: 'Barra de dominadas' },
      { value: 'Banco', label: 'Banco' },
      { value: 'Cable', label: 'Cable' },
      { value: 'Kettlebell', label: 'Kettlebell' }
    ],
    nivelesDificultad: [
      { value: 'Principiante', label: 'Principiante' },
      { value: 'Intermedio', label: 'Intermedio' },
      { value: 'Avanzado', label: 'Avanzado' }
    ],
    nivelesIntensidad: [
      { value: 'Baja', label: 'Baja' },
      { value: 'Media', label: 'Media' },
      { value: 'Alta', label: 'Alta' }
    ],
    tiposEjercicio: [
      { value: 'Fuerza', label: 'Fuerza' },
      { value: 'Cardio', label: 'Cardio' },
      { value: 'Flexibilidad', label: 'Flexibilidad' },
      { value: 'HIIT', label: 'HIIT' },
      { value: 'Resistencia', label: 'Resistencia' },
      { value: 'Potencia', label: 'Potencia' },
      { value: 'Estabilidad', label: 'Estabilidad' }
    ]
  }), []);
};
