import { apiRequest } from './api';
import { EstadisticasResponse, ProgresoEjerciciosResponse } from '../types/estadisticas';

export const estadisticasService = {
  // Obtener estadísticas generales del cliente (para entrenadores)
  async getEstadisticasCliente(clienteId: string): Promise<EstadisticasResponse> {
    try {
      const response = await apiRequest(`/api/estadisticas/cliente/${clienteId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasCliente:', error);
      throw error;
    }
  },

  // Obtener estadísticas semanales del cliente (para entrenadores)
  async getEstadisticasSemanal(
    clienteId: string, 
    numeroSemana: number, 
    anio: number
  ): Promise<EstadisticasResponse> {
    try {
      const response = await apiRequest(`/api/estadisticas/cliente/${clienteId}/semanal/${numeroSemana}/${anio}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasSemanal:', error);
      throw error;
    }
  },

  // Obtener progreso de ejercicios del cliente (para entrenadores)
  async getProgresoEjercicios(clienteId: string): Promise<ProgresoEjerciciosResponse> {
    try {
      const response = await apiRequest(`/api/estadisticas/cliente/${clienteId}/ejercicios`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error en getProgresoEjercicios:', error);
      throw error;
    }
  },

  // Obtener progreso personal del cliente
  async getMiProgreso(): Promise<EstadisticasResponse> {
    try {
      const response = await apiRequest('/api/estadisticas/mi-progreso', {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getMiProgreso:', error);
      throw error;
    }
  },

  // Obtener progreso semanal personal del cliente
  async getMiProgresoSemanal(
    numeroSemana: number, 
    anio: number
  ): Promise<EstadisticasResponse> {
    try {
      const response = await apiRequest(`/api/estadisticas/mi-progreso/semanal?numeroSemana=${numeroSemana}&anio=${anio}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      // El backend ahora devuelve alertas para el cliente
      return {
        success: data.success,
        message: data.message,
        estadisticas: data.estadisticas,
        alertas: data.alertas || []
      };
    } catch (error) {
      console.error('Error en getMiProgresoSemanal:', error);
      throw error;
    }
  },

  // Obtener progreso personal de ejercicios del cliente
  async getMiProgresoEjercicios(): Promise<ProgresoEjerciciosResponse> {
    try {
      const response = await apiRequest('/api/estadisticas/mi-progreso/ejercicios', {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getMiProgresoEjercicios:', error);
      throw error;
    }
  },

  // Obtener rachas de entrenamiento
  getRachasEntrenamiento: async () => {
    try {
      const response = await apiRequest('/api/estadisticas/rachas', {
        method: 'GET',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getRachasEntrenamiento:', error);
      throw error;
    }
  },

  // Obtener clientes del trabajador con sus estadísticas
  getClientesTrabajador: async (semana?: number, año?: number) => {
    try {
      const params = new URLSearchParams();
      if (semana) params.append('semana', semana.toString());
      if (año) params.append('año', año.toString());

      const response = await apiRequest(`/api/estadisticas/trabajador/clientes?${params.toString()}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getClientesTrabajador:', error);
      throw error;
    }
  },

  // Obtener detalles completos de un cliente específico
  getDetallesCliente: async (clienteId: string) => {
    try {
      const response = await apiRequest(`/api/estadisticas/trabajador/cliente/${clienteId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getDetallesCliente:', error);
      throw error;
    }
  },
};
