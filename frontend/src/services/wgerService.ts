import { WgerExercise, WgerSearchResponse, WgerExerciseDetailsResponse } from '../types/wger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const wgerService = {
  /**
   * Buscar ejercicios en wger
   */
  async buscarEjercicios(query: string, limit = 20): Promise<WgerExercise[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wger/ejercicios?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: WgerSearchResponse = await response.json();
      return data.ejercicios;
    } catch (error) {
      console.error('Error al buscar ejercicios en wger:', error);
      throw new Error('Error al buscar ejercicios en wger');
    }
  },

  /**
   * Obtener detalles de un ejercicio específico de wger
   */
  async obtenerDetallesEjercicio(exerciseId: number): Promise<WgerExercise> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wger/ejercicios/${exerciseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: WgerExerciseDetailsResponse = await response.json();
      return data.ejercicio;
    } catch (error) {
      console.error('Error al obtener detalles del ejercicio wger:', error);
      throw new Error('Error al obtener detalles del ejercicio');
    }
  }
};
