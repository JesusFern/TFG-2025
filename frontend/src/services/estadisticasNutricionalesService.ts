import { apiRequest } from './api';
import {
  RespuestaEstadisticasNutricionales,
  RespuestaEstadisticasNutricionalesSemanal,
  RespuestaProgresoComidas,
  RespuestaRachasNutricionales
} from '../types/estadisticasNutricionales';

class EstadisticasNutricionalesService {
  /**
   * Obtener estadísticas nutricionales generales del usuario
   */
  async getMiProgresoNutricional(): Promise<RespuestaEstadisticasNutricionales> {
    try {
      const response = await apiRequest('/api/diets-seguimiento/estadisticas-generales', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas nutricionales');
      }

      const data = await response.json();
      return {
        success: true,
        estadisticas: data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas nutricionales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener estadísticas nutricionales semanales del usuario
   */
  async getMiProgresoNutricionalSemanal(
    numeroSemana: number, 
    año: number
  ): Promise<RespuestaEstadisticasNutricionalesSemanal> {
    try {
      const params = new URLSearchParams({
        numeroSemana: numeroSemana.toString(),
        año: año.toString()
      });

      const response = await apiRequest(`/api/diets-seguimiento/estadisticas-semanal?${params}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas semanales');
      }

      const data = await response.json();
      return {
        success: true,
        estadisticas: data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas semanales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener progreso de comidas específicas
   */
  async getMiProgresoComidas(): Promise<RespuestaProgresoComidas> {
    try {
      const response = await apiRequest('/api/diets-seguimiento/progreso-comidas', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener progreso de comidas');
      }

      const data = await response.json();
      return {
        success: true,
        progreso: data
      };
    } catch (error) {
      console.error('Error al obtener progreso de comidas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener rachas nutricionales del usuario
   */
  async getRachasNutricionales(): Promise<RespuestaRachasNutricionales> {
    try {
      const response = await apiRequest('/api/diets-seguimiento/rachas-nutricionales', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener rachas nutricionales');
      }

      const data = await response.json();
      return {
        success: true,
        rachas: data
      };
    } catch (error) {
      console.error('Error al obtener rachas nutricionales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener estadísticas de una dieta específica
   */
  async getEstadisticasDieta(dietaId: string): Promise<RespuestaEstadisticasNutricionalesSemanal> {
    try {
      const response = await apiRequest(`/api/diets-seguimiento/${dietaId}/estadisticas-seguimiento`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas de la dieta');
      }

      const data = await response.json();
      return {
        success: true,
        estadisticas: data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de la dieta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const estadisticasNutricionalesService = new EstadisticasNutricionalesService();
