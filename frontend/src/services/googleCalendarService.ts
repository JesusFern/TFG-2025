import { apiRequest } from './api';

// Tipos para Google Calendar
export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
  creator?: {
    email: string;
  };
  organizer?: {
    email: string;
  };
  htmlLink?: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export type UpdateCalendarEventRequest = CreateCalendarEventRequest;

export interface CalendarEventsResponse {
  events: GoogleCalendarEvent[];
  total: number;
}

export interface CalendarStatusResponse {
  connected: boolean;
  hasRefreshToken: boolean;
}

export interface AuthUrlResponse {
  authUrl: string;
}

export interface CallbackResponse {
  message: string;
  connected: boolean;
}

export interface DisconnectResponse {
  message: string;
  connected: boolean;
}

class GoogleCalendarService {
  private baseEndpoint = '/api/google';

  // Obtener URL de autenticación de Google
  async getAuthUrl(): Promise<AuthUrlResponse> {
    const response = await apiRequest(`${this.baseEndpoint}/auth/url`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error obteniendo URL de autenticación' }));
      throw new Error(errorData.message || 'Error obteniendo URL de autenticación');
    }
    return response.json();
  }

  // Manejar callback de Google OAuth
  async handleCallback(code: string): Promise<CallbackResponse> {
    const response = await apiRequest(`${this.baseEndpoint}/callback?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error procesando callback de Google' }));
      throw new Error(errorData.message || 'Error procesando callback de Google');
    }
    return response.json();
  }

  // Obtener estado de conexión del calendario
  async getCalendarStatus(): Promise<CalendarStatusResponse> {
    const response = await apiRequest(`${this.baseEndpoint}/status`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error obteniendo estado del calendario' }));
      throw new Error(errorData.message || 'Error obteniendo estado del calendario');
    }
    return response.json();
  }

  // Obtener eventos del calendario
  async getCalendarEvents(params?: {
    startDate?: string;
    endDate?: string;
    maxResults?: number;
  }): Promise<CalendarEventsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.maxResults) {
      queryParams.append('maxResults', params.maxResults.toString());
    }

    const endpoint = `${this.baseEndpoint}/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error obteniendo eventos del calendario' }));
      throw new Error(errorData.message || 'Error obteniendo eventos del calendario');
    }
    return response.json();
  }

  // Crear evento en el calendario
  async createCalendarEvent(eventData: CreateCalendarEventRequest): Promise<{ message: string; event: GoogleCalendarEvent }> {
    const response = await apiRequest(`${this.baseEndpoint}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error creando evento en el calendario' }));
      
      // Si el error es de refresh token expirado, lanzar error específico
      if (errorData.error === 'refresh_token_expired') {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      
      throw new Error(errorData.message || 'Error creando evento en el calendario');
    }
    return response.json();
  }

  // Actualizar evento en el calendario
  async updateCalendarEvent(eventId: string, eventData: UpdateCalendarEventRequest): Promise<{ message: string; event: GoogleCalendarEvent }> {
    const response = await apiRequest(`${this.baseEndpoint}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error actualizando evento en el calendario' }));
      throw new Error(errorData.message || 'Error actualizando evento en el calendario');
    }
    return response.json();
  }

  // Eliminar evento del calendario
  async deleteCalendarEvent(eventId: string): Promise<{ message: string; eventId: string }> {
    const response = await apiRequest(`${this.baseEndpoint}/events/${eventId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error eliminando evento del calendario' }));
      throw new Error(errorData.message || 'Error eliminando evento del calendario');
    }
    return response.json();
  }

  // Desconectar Google Calendar
  async disconnectCalendar(): Promise<DisconnectResponse> {
    const response = await apiRequest(`${this.baseEndpoint}/disconnect`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconectando Google Calendar' }));
      throw new Error(errorData.message || 'Error desconectando Google Calendar');
    }
    return response.json();
  }
}

export const googleCalendarService = new GoogleCalendarService();
