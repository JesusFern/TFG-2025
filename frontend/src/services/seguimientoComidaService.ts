import { apiRequest } from './api';
import type { 
  SeguimientoPlato, 
  ActualizarSeguimientoPlatoRequest, 
  EstadisticasSeguimiento,
  RespuestaSeguimientoPaginada
} from '../types/seguimientoComida';

// Servicio para actualizar seguimiento de un plato específico
export const actualizarSeguimientoPlato = async (
  dietaId: string,
  diaIndex: number,
  comidaIndex: number,
  platoIndex: number,
  datos: ActualizarSeguimientoPlatoRequest
): Promise<SeguimientoPlato> => {
  try {
    const url = `/api/diets-seguimiento/${dietaId}/dias/${diaIndex}/comidas/${comidaIndex}/platos/${platoIndex}/seguimiento`;
    
    const response = await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar seguimiento');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar seguimiento de plato:', error);
    throw error;
  }
};

// Servicio para obtener seguimiento de platos con filtros
export const obtenerSeguimientoPlatos = async (
  dietaId: string,
  params?: {
    diaIndex?: number;
    comidaIndex?: number;
    satisfaccionMinima?: number;
    cumplimientoMinimo?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    offset?: number;
  }
): Promise<RespuestaSeguimientoPaginada> => {
  try {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/api/diets-seguimiento/${dietaId}/seguimiento${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener seguimiento');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener seguimiento de platos:', error);
    throw error;
  }
};

// Servicio para obtener estadísticas de seguimiento
export const obtenerEstadisticasSeguimiento = async (
  dietaId: string,
  params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    incluirTendencias?: boolean;
  }
): Promise<EstadisticasSeguimiento> => {
  try {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/api/diets-seguimiento/${dietaId}/estadisticas-seguimiento${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estadísticas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas de seguimiento:', error);
    throw error;
  }
};
