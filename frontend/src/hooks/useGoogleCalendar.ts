import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Usar useRef para evitar re-renders y procesamiento múltiple
  const processedCodeRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

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
      setEvents([...response.events]); // Forzar nueva referencia del array
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError(err instanceof Error ? err.message : 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar bucles

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
    // Si ya estamos procesando, salir inmediatamente
    if (isProcessingRef.current) {
      console.log('Ya se está procesando un código, ignorando llamada duplicada');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Error en la autenticación con Google: ' + error);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && code !== processedCodeRef.current) {
      // Marcar como procesando INMEDIATAMENTE
      isProcessingRef.current = true;
      processedCodeRef.current = code;
      
      // Limpiar la URL INMEDIATAMENTE para evitar procesamiento duplicado
      window.history.replaceState({}, document.title, window.location.pathname);
      
      try {
        console.log('Procesando código de autorización de Google...');
        setLoading(true);
        setError(null);
        
        // Procesar el código de autorización
        await googleCalendarService.handleCallback(code);
        setIsConnected(true);
        
        console.log('Código procesado exitosamente, cargando eventos...');
        // Cargar eventos después de conectar
        await refreshEvents();
        
      } catch (err) {
        console.error('Error procesando callback de Google:', err);
        
        // Si el error es invalid_grant, significa que el código ya expiró o ya fue usado
        if (err instanceof Error && (err.message.includes('invalid_grant') || err.message.includes('ya ha sido usado'))) {
          setError('El código de autorización ha expirado o ya ha sido usado. Por favor, intenta conectar nuevamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Error procesando autenticación');
        }
        
        // Resetear refs para permitir reintento
        processedCodeRef.current = null;
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
      }
    }
  }, [refreshEvents]);

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
      processedCodeRef.current = null; // Limpiar código procesado
      isProcessingRef.current = false; // Resetear flag de procesamiento
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
      // Pequeño delay para asegurar que el backend haya procesado la operación
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refrescar eventos directamente sin dependencia
      const response = await googleCalendarService.getCalendarEvents({ maxResults: 50 });
      console.log('Eventos obtenidos después de crear:', response.events.length);
      setEvents([...response.events]); // Forzar nueva referencia del array
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
  }, []);

  // Actualizar evento
  const updateEvent = useCallback(async (eventId: string, eventData: UpdateCalendarEventRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await googleCalendarService.updateCalendarEvent(eventId, eventData);
      // Pequeño delay para asegurar que el backend haya procesado la operación
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refrescar eventos directamente sin dependencia
      const response = await googleCalendarService.getCalendarEvents({ maxResults: 50 });
      console.log('Eventos obtenidos después de actualizar:', response.events.length);
      setEvents([...response.events]); // Forzar nueva referencia del array
    } catch (err) {
      console.error('Error actualizando evento:', err);
      setError(err instanceof Error ? err.message : 'Error actualizando evento');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar evento
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await googleCalendarService.deleteCalendarEvent(eventId);
      // Pequeño delay para asegurar que el backend haya procesado la operación
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refrescar eventos directamente sin dependencia
      const response = await googleCalendarService.getCalendarEvents({ maxResults: 50 });
      console.log('Eventos obtenidos después de eliminar:', response.events.length);
      setEvents([...response.events]); // Forzar nueva referencia del array
    } catch (err) {
      console.error('Error eliminando evento:', err);
      setError(err instanceof Error ? err.message : 'Error eliminando evento');
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efectos
  useEffect(() => {
    // Primero verificar si hay un callback de Google OAuth
    // Solo ejecutar una vez al montar el componente
    checkForGoogleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío para ejecutar solo una vez

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
