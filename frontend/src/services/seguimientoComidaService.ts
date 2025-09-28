import { apiRequest } from './api';

// Interfaces para el seguimiento de platos
export interface SeguimientoPlato {
  satisfaccion?: number; // 1-5
  cumplimiento?: number; // 1-5
  notaUsuario?: string;
}

export interface ActualizarSeguimientoPlatoRequest {
  satisfaccion?: number;
  cumplimiento?: number;
  notaUsuario?: string;
}

export interface EstadisticasSeguimiento {
  satisfaccionPromedio: number;
  porcentajeCumplimiento: number;
  comidasFavoritas: string[];
  comidasMenosGustadas: string[];
  ingredientesMasModificados: string[];
  tendenciaSatisfaccion: 'mejorando' | 'empeorando' | 'estable';
  tendenciaCumplimiento: 'mejorando' | 'empeorando' | 'estable';
  totalComidas: number;
  comidasConsumidas: number;
  comidasOmitidas: number;
  comidasParciales: number;
}

export interface SeguimientoPlatoConInfo extends SeguimientoPlato {
  diaIndex: number;
  comidaIndex: number;
  platoIndex: number;
  fecha: Date;
  nombreComida: string;
  nombrePlato: string;
}

export interface RespuestaSeguimientoPaginada {
  seguimientos: SeguimientoPlatoConInfo[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

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
