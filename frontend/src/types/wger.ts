export interface WgerExercise {
  id: number;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
  videoUrl?: string;
}

export interface WgerSearchResponse {
  ejercicios: WgerExercise[];
  total: number;
}

export interface WgerExerciseDetailsResponse {
  ejercicio: WgerExercise;
}
