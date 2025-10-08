import { apiRequest } from './api';
import {
  Valoracion,
  CrearValoracionDTO,
  ActualizarValoracionDTO,
  FiltrosValoraciones,
  ValoracionesResponse,
  EstadisticasValoraciones,
  EstadisticasValoracionesPorTipo,
  TipoTrabajadorDisponible,
  TiposTrabajadorDisponiblesResponse,
  VerificacionValoracion,
  VerificacionValoracionResponse,
  EstadisticasValoracionesResponse,
  ValoracionResponse,
  CrearValoracionResponse,
  ActualizarValoracionResponse,
  EliminarValoracionResponse
} from '../types/valoraciones';

export class ValoracionService {
  // Crear una nueva valoración
  static async crearValoracion(datos: CrearValoracionDTO): Promise<Valoracion> {
    try {
      const response = await apiRequest('/api/valoraciones', {
        method: 'POST',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la valoración');
      }

      const data: CrearValoracionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al crear valoración:', error);
      throw error;
    }
  }

  // Obtener todas las valoraciones con filtros
  static async obtenerValoraciones(filtros: FiltrosValoraciones = {}): Promise<ValoracionesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/valoraciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las valoraciones');
      }

      const data: ValoracionesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener valoraciones:', error);
      throw error;
    }
  }

  // Obtener una valoración por ID
  static async obtenerValoracionPorId(id: string): Promise<Valoracion> {
    try {
      const response = await apiRequest(`/api/valoraciones/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la valoración');
      }

      const data: ValoracionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al obtener valoración:', error);
      throw error;
    }
  }

  // Actualizar una valoración
  static async actualizarValoracion(id: string, datos: ActualizarValoracionDTO): Promise<Valoracion> {
    try {
      const response = await apiRequest(`/api/valoraciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la valoración');
      }

      const data: ActualizarValoracionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al actualizar valoración:', error);
      throw error;
    }
  }

  // Eliminar una valoración (soft delete)
  static async eliminarValoracion(id: string): Promise<Valoracion> {
    try {
      const response = await apiRequest(`/api/valoraciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la valoración');
      }

      const data: EliminarValoracionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al eliminar valoración:', error);
      throw error;
    }
  }

  // Obtener estadísticas de valoraciones
  static async obtenerEstadisticas(filtros: Partial<FiltrosValoraciones> = {}): Promise<EstadisticasValoraciones> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/valoraciones/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las estadísticas');
      }

      const data: EstadisticasValoracionesResponse = await response.json();
      
      // Transformar distribucionCalificaciones de objeto a array
      const distribucionCalificaciones = data.data.distribucionCalificaciones;
      const distribucionArray = typeof distribucionCalificaciones === 'object' && !Array.isArray(distribucionCalificaciones)
        ? Object.entries(distribucionCalificaciones as Record<string, number>).map(([calificacion, cantidad]) => ({
            calificacion: parseInt(calificacion),
            cantidad,
            porcentaje: data.data.totalValoraciones > 0 
              ? (cantidad / data.data.totalValoraciones) * 100 
              : 0
          }))
        : distribucionCalificaciones;
      
      return {
        ...data.data,
        distribucionCalificaciones: distribucionArray
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener valoraciones de un trabajador específico
  static async obtenerValoracionesPorTrabajador(trabajadorId: string, filtros: Partial<FiltrosValoraciones> = {}): Promise<ValoracionesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/valoraciones/trabajador/${trabajadorId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las valoraciones del trabajador');
      }

      const data: ValoracionesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener valoraciones del trabajador:', error);
      throw error;
    }
  }

  // Obtener valoraciones de un cliente específico
  static async obtenerValoracionesPorCliente(clienteId: string, filtros: Partial<FiltrosValoraciones> = {}): Promise<ValoracionesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/valoraciones/cliente/${clienteId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las valoraciones del cliente');
      }

      const data: ValoracionesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener valoraciones del cliente:', error);
      throw error;
    }
  }

  // Verificar si un cliente puede valorar a un trabajador
  static async verificarPuedeValorar(trabajadorId: string): Promise<VerificacionValoracion> {
    try {
      const response = await apiRequest(`/api/valoraciones/can-valorar/verify?trabajadorId=${trabajadorId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar permisos de valoración');
      }

      const data: VerificacionValoracionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      throw error;
    }
  }

  // Obtener tipos de trabajador disponibles para valorar
  static async obtenerTiposTrabajadorDisponibles(trabajadorId: string): Promise<TipoTrabajadorDisponible[]> {
    try {
      const response = await apiRequest(`/api/valoraciones/trabajador/${trabajadorId}/tipos-disponibles`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener tipos disponibles');
      }

      const data: TiposTrabajadorDisponiblesResponse = await response.json();
      return data.data.tiposDisponibles;
    } catch (error) {
      console.error('Error al obtener tipos disponibles:', error);
      throw error;
    }
  }

  // Obtener estadísticas detalladas por tipo de trabajador
  static async obtenerEstadisticasPorTipo(trabajadorId: string): Promise<EstadisticasValoracionesPorTipo[]> {
    try {
      const response = await apiRequest(`/api/valoraciones/trabajador/${trabajadorId}/stats-by-tipo`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas por tipo');
      }

      const data = await response.json();
      
      // Tipo para la respuesta del backend
      interface StatsBackend {
        totalValoraciones: number;
        calificacionPromedio: number;
        distribucionCalificaciones: Record<string, number>;
        valoracionesPorTipo?: Record<string, number>;
        valoracionesRecientes?: number;
      }
      
      const estadisticasObj = data.data as {
        nutricionista?: StatsBackend;
        entrenador?: StatsBackend;
        general?: StatsBackend;
      };
      
      const estadisticasArray: EstadisticasValoracionesPorTipo[] = [];
      
      // Procesar Nutricionista
      if (estadisticasObj.nutricionista && estadisticasObj.nutricionista.totalValoraciones > 0) {
        const statsNutricionista = estadisticasObj.nutricionista;
        const dist = statsNutricionista.distribucionCalificaciones;
        const distribucionArray = typeof dist === 'object' && !Array.isArray(dist)
          ? Object.entries(dist as Record<string, number>).map(([calificacion, cantidad]) => ({
              calificacion: parseInt(calificacion),
              cantidad,
              porcentaje: (cantidad / statsNutricionista.totalValoraciones) * 100
            }))
          : dist;
        
        estadisticasArray.push({
          tipo: 'Nutricionista',
          totalValoraciones: statsNutricionista.totalValoraciones,
          calificacionPromedio: statsNutricionista.calificacionPromedio,
          distribucionCalificaciones: distribucionArray,
          valoracionesRecientes: []
        });
      }
      
      // Procesar Entrenador personal
      if (estadisticasObj.entrenador && estadisticasObj.entrenador.totalValoraciones > 0) {
        const statsEntrenador = estadisticasObj.entrenador;
        const dist = statsEntrenador.distribucionCalificaciones;
        const distribucionArray = typeof dist === 'object' && !Array.isArray(dist)
          ? Object.entries(dist as Record<string, number>).map(([calificacion, cantidad]) => ({
              calificacion: parseInt(calificacion),
              cantidad,
              porcentaje: (cantidad / statsEntrenador.totalValoraciones) * 100
            }))
          : dist;
        
        estadisticasArray.push({
          tipo: 'Entrenador personal',
          totalValoraciones: statsEntrenador.totalValoraciones,
          calificacionPromedio: statsEntrenador.calificacionPromedio,
          distribucionCalificaciones: distribucionArray,
          valoracionesRecientes: []
        });
      }
      
      return estadisticasArray;
    } catch (error) {
      console.error('Error al obtener estadísticas por tipo:', error);
      throw error;
    }
  }
}
