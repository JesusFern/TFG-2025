import { useState, useEffect, useCallback } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';
import { 
  GoogleCalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest
} from '../types/googleCalendar';

interface UseGoogleCalendarReturn {
  // Estado
  isConnected: boolean;
  isConnecting: boolean;
  events: GoogleCalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  connectToGoogle: () => Promise<void>;
  disconnectFromGoogle: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  createEvent: (eventData: CreateCalendarEventRequest) => Promise<void>;
  updateEvent: (eventId: string, eventData: UpdateCalendarEventRequest) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  clearError: () => void;
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedCode, setProcessedCode] = useState<string | null>(null);

  // Refrescar eventos
  const refreshEvents = useCallback(async () => {
    try {
      console.log('Refrescando eventos...');
      setLoading(true);
      setError(null);
      
      const response = await googleCalendarService.getCalendarEvents({
        maxResults: 50
      });
      
      console.log('Eventos obtenidos:', response.events.length);
      setEvents(response.events);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError(err instanceof Error ? err.message : 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar estado de conexión
  const checkConnectionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await googleCalendarService.getCalendarStatus();
      setIsConnected(status.connected);
    } catch (err) {
      console.error('Error verificando estado de conexión:', err);
      setError(err instanceof Error ? err.message : 'Error verificando conexión');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Detectar si estamos en el callback de Google OAuth
  const checkForGoogleCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Error en la autenticación con Google: ' + error);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && code !== processedCode) {
      try {
        setLoading(true);
        setError(null);
        setProcessedCode(code); // Marcar el código como procesado
        
        // Procesar el código de autorización
        await googleCalendarService.handleCallback(code);
        setIsConnected(true);
        
        // Limpiar la URL para evitar que se procese de nuevo
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Cargar eventos después de conectar
        await refreshEvents();
        
      } catch (err) {
        console.error('Error procesando callback de Google:', err);
        
        // Si el error es invalid_grant, significa que el código ya expiró
        if (err instanceof Error && err.message.includes('invalid_grant')) {
          setError('El código de autorización ha expirado. Por favor, intenta conectar nuevamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Error procesando autenticación');
        }
        
        // Limpiar la URL en caso de error
        window.history.replaceState({}, document.title, window.location.pathname);
        setProcessedCode(null); // Resetear para permitir reintento
      } finally {
        setLoading(false);
      }
    }
  }, [refreshEvents, processedCode]);

  // Conectar a Google Calendar
  const connectToGoogle = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const { authUrl } = await googleCalendarService.getAuthUrl();
      
      // Redirigir a Google OAuth (se regresará a la misma página con el código)
      window.location.href = authUrl;
      
    } catch (err) {
      console.error('Error conectando a Google Calendar:', err);
      setError(err instanceof Error ? err.message : 'Error conectando a Google Calendar');
      setIsConnecting(false);
    }
  }, []);

  // Desconectar de Google Calendar
  const disconnectFromGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await googleCalendarService.disconnectCalendar();
      setIsConnected(false);
      setEvents([]);
      setProcessedCode(null); // Limpiar código procesado
    } catch (err) {
      console.error('Error desconectando de Google Calendar:', err);
      setError(err instanceof Error ? err.message : 'Error desconectando de Google Calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear evento
  const createEvent = useCallback(async (eventData: CreateCalendarEventRequest) => {
    try {
      console.log('Iniciando creación de evento...');
      setLoading(true);
      setError(null);
      
      const result = await googleCalendarService.createCalendarEvent(eventData);
      console.log('Evento creado en backend:', result);
      
      console.log('Refrescando eventos después de crear...');
      await refreshEvents(); // Refrescar lista de eventos
    } catch (err) {
      console.error('Error creando evento:', err);
      
      // Si el error es de refresh token expirado, desconectar automáticamente
      if (err instanceof Error && err.message === 'REFRESH_TOKEN_EXPIRED') {
        setIsConnected(false);
        setEvents([]);
        setError('Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.');
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Error creando evento');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [refreshEvents]);

  // Actualizar evento
  const updateEvent = useCallback(async (eventId: string, eventData: UpdateCalendarEventRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await googleCalendarService.updateCalendarEvent(eventId, eventData);
      await refreshEvents(); // Refrescar lista de eventos
    } catch (err) {
      console.error('Error actualizando evento:', err);
      setError(err instanceof Error ? err.message : 'Error actualizando evento');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [refreshEvents]);

  // Eliminar evento
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await googleCalendarService.deleteCalendarEvent(eventId);
      await refreshEvents(); // Refrescar lista de eventos
    } catch (err) {
      console.error('Error eliminando evento:', err);
      setError(err instanceof Error ? err.message : 'Error eliminando evento');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [refreshEvents]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efectos
  useEffect(() => {
    // Primero verificar si hay un callback de Google OAuth
    checkForGoogleCallback();
  }, [checkForGoogleCallback]);

  useEffect(() => {
    // Si no hay callback, verificar estado de conexión
    if (!window.location.search.includes('code=') && !window.location.search.includes('error=')) {
      checkConnectionStatus();
    }
  }, [checkConnectionStatus]);

  useEffect(() => {
    if (isConnected) {
      refreshEvents();
    }
  }, [isConnected, refreshEvents]);

  return {
    // Estado
    isConnected,
    isConnecting,
    events,
    loading,
    error,
    
    // Acciones
    connectToGoogle,
    disconnectFromGoogle,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError
  };
};
