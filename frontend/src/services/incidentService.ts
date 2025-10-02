import { apiRequest } from './api';

export interface CrearIncidenciaData {
  descripcion: string;
  imagenes?: File[];
}

export interface IncidenciaResponse {
  id: string;
  descripcion: string;
  estado: string;
  creadorId: string;
  administradorAsignado?: string;
  imagenes?: string[];
  fechaResolucion?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Información del creador (para admin)
  creador?: {
    fullName: string;
    email: string;
    role: string;
    workerType?: string;
  };
  // Información del administrador asignado (para admin)
  administrador?: {
    fullName: string;
    email: string;
  };
}

export class IncidentService {
  static async crearIncidencia(data: CrearIncidenciaData): Promise<IncidenciaResponse> {
    try {
      const formData = new FormData();
      formData.append('descripcion', data.descripcion);
      
      // Agregar imágenes si existen
      if (data.imagenes && data.imagenes.length > 0) {
        data.imagenes.forEach((imagen) => {
          formData.append('imagenes', imagen);
        });
      }

      const response = await apiRequest('/api/incidents', {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, el navegador lo hará automáticamente para FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la incidencia');
      }

      const responseData = await response.json();
      return responseData.incidencia;
    } catch (error) {
      console.error('Error al crear incidencia:', error);
      throw error;
    }
  }

  static async obtenerMisIncidencias(): Promise<IncidenciaResponse[]> {
    try {
      const response = await apiRequest('/api/incidents/mis-incidencias', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las incidencias');
      }

      const responseData = await response.json();
      return responseData.incidencias || [];
    } catch (error) {
      console.error('Error al obtener incidencias:', error);
      throw error;
    }
  }

  static async eliminarIncidencia(incidenciaId: string): Promise<void> {
    try {
      const response = await apiRequest(`/api/incidents/${incidenciaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la incidencia');
      }
    } catch (error) {
      console.error('Error al eliminar incidencia:', error);
      throw error;
    }
  }

  static async obtenerTodasLasIncidencias(): Promise<IncidenciaResponse[]> {
    try {
      const response = await apiRequest('/api/incidents/admin', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las incidencias');
      }

      const data = await response.json();
      return data.incidencias || [];
    } catch (error) {
      console.error('Error al obtener todas las incidencias:', error);
      throw error;
    }
  }

  static async marcarComoResuelta(incidenciaId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await apiRequest(`/api/incidents/${incidenciaId}/marcar-resuelta`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: 'Resuelta'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar la incidencia como resuelta');
      }
    } catch (error) {
      console.error('Error al marcar incidencia como resuelta:', error);
      throw error;
    }
  }

  static async asignarIncidencia(incidenciaId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await apiRequest(`/api/incidents/${incidenciaId}/asignar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar la incidencia');
      }
    } catch (error) {
      console.error('Error al asignar incidencia:', error);
      throw error;
    }
  }
}

export default IncidentService;


