import { WgerExercise, WgerSearchResponse, WgerExerciseDetailsResponse } from '../types/wger';
import { apiClient } from './apiClient';

export const wgerService = {
  /**
   * Buscar ejercicios en wger
   */
  async buscarEjercicios(query: string, limit = 20): Promise<WgerExercise[]> {
    try {
      const response = await apiClient.get<WgerSearchResponse>(
        `/wger/ejercicios?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      return response.data.ejercicios;
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
      const response = await apiClient.get<WgerExerciseDetailsResponse>(
        `/wger/ejercicios/${exerciseId}`
      );

      return response.data.ejercicio;
    } catch (error) {
      console.error('Error al obtener detalles del ejercicio wger:', error);
      throw new Error('Error al obtener detalles del ejercicio');
    }
  }
};
