import { apiRequest } from './api';
import {
  Cita,
  CrearCitaDTO,
  ActualizarCitaDTO,
  ReagendarCitaDTO,
  CancelarCitaDTO,
  FiltrosCitas,
  CitasResponse,
  DisponibilidadProfesional,
  EstadisticasCitas,
  ProfesionalCita
} from '../types/citas';


export class CitaService {
  // Crear una nueva cita
  static async crearCita(datos: CrearCitaDTO): Promise<Cita> {
    try {
      const response = await apiRequest('/api/citas', {
        method: 'POST',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }

  // Obtener citas con filtros
  static async obtenerCitas(filtros: FiltrosCitas = {}): Promise<CitasResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/citas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las citas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }

  // Obtener una cita por ID
  static async obtenerCitaPorId(citaId: string): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al obtener cita por ID:', error);
      throw error;
    }
  }

  // Actualizar una cita
  static async actualizarCita(citaId: string, datos: ActualizarCitaDTO): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  }

  // Cancelar una cita
  static async cancelarCita(citaId: string, datos: CancelarCitaDTO): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/cancelar`, {
        method: 'POST',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  }

  // Reagendar una cita
  static async reagendarCita(citaId: string, datos: ReagendarCitaDTO): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/reagendar`, {
        method: 'POST',
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reagendar la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      throw error;
    }
  }

  // Confirmar una cita
  static async confirmarCita(citaId: string): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/confirmar`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al confirmar la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      throw error;
    }
  }

  // Completar una cita
  static async completarCita(citaId: string): Promise<Cita> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/completar`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al completar la cita');
      }

      const data = await response.json();
      return data.cita;
    } catch (error) {
      console.error('Error al completar cita:', error);
      throw error;
    }
  }

  // Obtener disponibilidad de un profesional
  static async obtenerDisponibilidadProfesional(
    profesionalId: string, 
    fecha: string
  ): Promise<DisponibilidadProfesional> {
    try {
      const response = await apiRequest(`/api/citas/disponibilidad/${profesionalId}?fecha=${fecha}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la disponibilidad');
      }

      const data = await response.json();
      return data.disponibilidad;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  }

  // Obtener estadísticas de citas
  static async obtenerEstadisticasCitas(): Promise<EstadisticasCitas> {
    try {
      const response = await apiRequest('/api/citas/estadisticas', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las estadísticas');
      }

      const data = await response.json();
      return data.estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener profesionales disponibles para citas
  static async obtenerProfesionalesDisponibles(): Promise<ProfesionalCita[]> {
    try {
      const response = await apiRequest('/api/users/workers/available', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los profesionales');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error al obtener profesionales:', error);
      throw error;
    }
  }

  // Obtener profesionales asignados a un cliente específico
  static async obtenerProfesionalesAsignados(clienteId: string): Promise<ProfesionalCita[]> {
    try {
      const response = await apiRequest(`/api/users/workers/assigned/${clienteId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los profesionales asignados');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error al obtener profesionales asignados:', error);
      throw error;
    }
  }

  // Verificar si una cita puede ser editada
  static puedeEditarCita(cita: Cita): boolean {
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    const ahora = new Date();
    
    // Solo se pueden editar citas futuras en estado pendiente
    return fechaCita > ahora && (cita.estado || 'pendiente') === 'pendiente';
  }

  // Verificar si una cita puede ser cancelada
  static puedeCancelarCita(cita: Cita): boolean {
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    const ahora = new Date();
    
    return fechaCita > ahora && !['completada', 'cancelada'].includes(cita.estado);
  }

  // Verificar si una cita puede ser reagendada
  static puedeReagendarCita(cita: Cita): boolean {
    const fechaCita = new Date(cita.fecha);
    const [hora, minutos] = cita.hora.split(':').map(Number);
    fechaCita.setHours(hora, minutos, 0, 0);
    const ahora = new Date();
    
    // No se puede reagendar si ya fue reagendada, completada o cancelada
    return fechaCita > ahora && !['completada', 'cancelada', 'reagendada'].includes(cita.estado || 'pendiente');
  }

  // Formatear fecha para mostrar
  static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  // Formatear hora para mostrar
  static formatearHora(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  }

  // Generar horarios disponibles (9:00 a 18:00 cada 30 minutos)
  static generarHorariosDisponibles(): string[] {
    const horarios: string[] = [];
    for (let hora = 8; hora < 21; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horario);
      }
    }
    return horarios;
  }

  // Actualizar el ID del evento de Google Calendar en una cita
  static async actualizarEventoId(citaId: string, googleEventId: string): Promise<void> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/google-event`, {
        method: 'PUT',
        body: JSON.stringify({ googleEventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el evento de Google Calendar');
      }
    } catch (error) {
      console.error('Error al actualizar evento de Google Calendar:', error);
      throw error;
    }
  }

  // Limpiar el ID del evento de Google Calendar de una cita
  static async limpiarEventoId(citaId: string): Promise<void> {
    try {
      const response = await apiRequest(`/api/citas/${citaId}/google-event`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al limpiar el evento de Google Calendar');
      }
    } catch (error) {
      console.error('Error al limpiar evento de Google Calendar:', error);
      throw error;
    }
  }
}

export default CitaService;
