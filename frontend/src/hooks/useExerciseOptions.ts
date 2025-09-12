import { useMemo } from 'react';

interface ExerciseOptions {
  gruposMusculares: { value: string; label: string }[];
  equipamientos: { value: string; label: string }[];
  nivelesDificultad: { value: string; label: string }[];
  nivelesIntensidad: { value: string; label: string }[];
}

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
      { value: 'Bandas de resistencia', label: 'Bandas de resistencia' }
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
    ]
  }), []);
};
