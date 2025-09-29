import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../config/socket';

// Tipos para los mensajes del socket
interface SocketMessage {
  _id: string;
  remitente: string;
  destinatario: string;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'archivo' | 'sistema';
  estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para los eventos del socket
interface SocketEvents {
  onNewMessage?: (data: { mensaje: SocketMessage; conversacionId: string }) => void;
  onMessageNotification?: (data: { mensaje: SocketMessage; conversacionId: string; remitente: string }) => void;
  onUserTyping?: (data: { userId: string; conversacionId: string; isTyping: boolean }) => void;
  onUserJoined?: (data: { userId: string; conversacionId: string }) => void;
  onUserStatusChange?: (data: { userId: string; status: 'online' | 'offline'; timestamp: Date }) => void;
  onMessageRead?: (data: { mensajeId: string; leidoPor: string; timestamp: Date }) => void;
  onNewNotification?: (data: { notificacion: unknown; timestamp: Date }) => void;
  onScheduledNotification?: (data: { notificacion: unknown; timestamp: Date }) => void;
  onInactiveTrackingNotification?: (data: { notificacion: unknown; timestamp: Date }) => void;
  onNotificationMarkedRead?: (data: { notificacionId: string; timestamp: Date }) => void;
  onNotificationDeleted?: (data: { notificacionId: string; timestamp: Date }) => void;
  onAllNotificationsMarkedRead?: (data: { actualizadas: number; timestamp: Date }) => void;
  onNotificationError?: (error: { error: string; details: string }) => void;
  onError?: (error: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
}

export const useSocket = (events: SocketEvents = {}) => {
  const { token, user } = useAuth();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsRef = useRef(events);

  // Actualizar eventsRef cuando events cambie
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Limpiar timeout de reconexión
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Conectar al servidor Socket.IO
  const connect = useCallback(() => {
    if (!token || !user) {
      console.warn('useSocket: No hay token o usuario para conectar');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('useSocket: Socket ya está conectado');
      return;
    }

    if (isConnecting) {
      console.log('useSocket: Ya se está intentando conectar');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    clearReconnectTimeout();

    try {
      
      
      const socket = io(SOCKET_CONFIG.url, {
        ...SOCKET_CONFIG.options,
        auth: {
          token: token
        }
      });

      socketRef.current = socket;

      // Eventos de conexión
      socket.on(SOCKET_EVENTS.CONNECT, () => {
        
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        
        // Notificar que el usuario está en línea
        socket.emit(SOCKET_EVENTS.USER_ONLINE);
        
        // Llamar callback de conexión si existe
        eventsRef.current.onConnect?.();
      });

      socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
        
        setIsConnected(false);
        setIsConnecting(false);
        
        // Llamar callback de desconexión si existe
        eventsRef.current.onDisconnect?.(reason);
        
        // Intentar reconectar si no fue una desconexión intencional
        if (reason === 'io server disconnect' || reason === 'transport close') {
          console.log('useSocket: Intentando reconectar...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (token && user) {
              connect();
            }
          }, 2000);
        }
      });

      socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: unknown) => {
        
        setIsConnecting(false);
        setConnectionError('Error de conexión');
        
        // Llamar callback de error si existe
        eventsRef.current.onError?.(error);
      });

      // Eventos de mensajería
      socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data: { mensaje: SocketMessage; conversacionId: string }) => {
        
        eventsRef.current.onNewMessage?.(data);
      });

      socket.on(SOCKET_EVENTS.MESSAGE_NOTIFICATION, (data: { mensaje: SocketMessage; conversacionId: string; remitente: string }) => {
        
        eventsRef.current.onMessageNotification?.(data);
      });

      socket.on(SOCKET_EVENTS.USER_TYPING, (data: { userId: string; conversacionId: string; isTyping: boolean }) => {
        
        eventsRef.current.onUserTyping?.(data);
      });

      socket.on(SOCKET_EVENTS.USER_JOINED_CONVERSATION, (data: { userId: string; conversacionId: string }) => {
        
        eventsRef.current.onUserJoined?.(data);
      });

      socket.on(SOCKET_EVENTS.USER_STATUS_CHANGE, (data: { userId: string; status: 'online' | 'offline'; timestamp: Date }) => {
        
        eventsRef.current.onUserStatusChange?.(data);
      });

      socket.on(SOCKET_EVENTS.MESSAGE_READ, (data: { mensajeId: string; leidoPor: string; timestamp: Date }) => {
        
        eventsRef.current.onMessageRead?.(data);
      });

      socket.on(SOCKET_EVENTS.MESSAGES_READ, (data: { mensajeIds: string[]; leidoPor: string; timestamp: Date }) => {
        console.log('useSocket: Múltiples mensajes marcados como leído:', data);
        data.mensajeIds.forEach(mensajeId => {
          eventsRef.current.onMessageRead?.({ mensajeId, leidoPor: data.leidoPor, timestamp: data.timestamp });
        });
      });

      socket.on(SOCKET_EVENTS.MESSAGE_ERROR, (error: unknown) => {
        
        eventsRef.current.onError?.(error);
      });

      // Eventos de notificaciones
      socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (data: { notificacion: unknown; timestamp: Date }) => {
        console.log('useSocket: Nueva notificación recibida:', data);
        eventsRef.current.onNewNotification?.(data);
      });

      socket.on(SOCKET_EVENTS.SCHEDULED_NOTIFICATION, (data: { notificacion: unknown; timestamp: Date }) => {
        console.log('useSocket: Notificación programada recibida:', data);
        eventsRef.current.onScheduledNotification?.(data);
      });

      socket.on(SOCKET_EVENTS.INACTIVE_TRACKING_NOTIFICATION, (data: { notificacion: unknown; timestamp: Date }) => {
        console.log('useSocket: Notificación de seguimiento inactivo recibida:', data);
        eventsRef.current.onInactiveTrackingNotification?.(data);
      });

      socket.on(SOCKET_EVENTS.NOTIFICATION_MARKED_READ, (data: { notificacionId: string; timestamp: Date }) => {
        console.log('useSocket: Notificación marcada como leída:', data);
        eventsRef.current.onNotificationMarkedRead?.(data);
      });

      socket.on(SOCKET_EVENTS.NOTIFICATION_DELETED, (data: { notificacionId: string; timestamp: Date }) => {
        console.log('useSocket: Notificación eliminada:', data);
        eventsRef.current.onNotificationDeleted?.(data);
      });

      socket.on(SOCKET_EVENTS.ALL_NOTIFICATIONS_MARKED_READ, (data: { actualizadas: number; timestamp: Date }) => {
        console.log('useSocket: Todas las notificaciones marcadas como leídas:', data);
        eventsRef.current.onAllNotificationsMarkedRead?.(data);
      });

      socket.on(SOCKET_EVENTS.NOTIFICATION_ERROR, (error: { error: string; details: string }) => {
        console.error('useSocket: Error en notificación:', error);
        eventsRef.current.onNotificationError?.(error);
      });

      // Conectar el socket
      socket.connect();

    } catch (error) {
      console.error('useSocket: Error al crear conexión:', error);
      setIsConnecting(false);
      setConnectionError('Error al crear conexión');
      eventsRef.current.onError?.(error);
    }
  }, [token, user, isConnecting, clearReconnectTimeout]);

  // Desconectar del servidor
  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    
    if (socketRef.current) {
      
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
    }
  }, [clearReconnectTimeout]);

  // Unirse a una conversación
  const joinConversation = useCallback((conversacionId: string) => {
    if (socketRef.current?.connected) {
      
      socketRef.current.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversacionId);
    } else {
      console.warn('useSocket: No se puede unir a conversación - socket no conectado');
    }
  }, []);

  // Salir de una conversación
  const leaveConversation = useCallback((conversacionId: string) => {
    if (socketRef.current?.connected) {
      
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, conversacionId);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback((data: {
    destinatario: string;
    contenido: string;
    tipo?: string;
    prioridad?: string;
    categoria?: string;
    adjuntos?: unknown[];
    metadata?: unknown;
    respuestaA?: string;
  }) => {
    if (socketRef.current?.connected) {
      
      socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, data);
    } else {
      console.warn('useSocket: No se puede enviar mensaje - socket no conectado');
      eventsRef.current.onError?.({ error: 'Socket no está conectado' });
    }
  }, []);

  // Marcar mensaje como leído
  const markAsRead = useCallback((mensajeId: string) => {
    if (socketRef.current?.connected) {
      
      socketRef.current.emit(SOCKET_EVENTS.MARK_AS_READ, mensajeId);
    }
  }, []);

  // Marcar múltiples mensajes como leídos (optimización)
  const markManyAsRead = useCallback((mensajeIds: string[]) => {
    if (socketRef.current?.connected && mensajeIds.length > 0) {
      
      socketRef.current.emit('mark_many_as_read', mensajeIds);
    }
  }, []);

  // Indicar que el usuario está escribiendo
  const startTyping = useCallback((conversacionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.TYPING_START, conversacionId);
    }
  }, []);

  const stopTyping = useCallback((conversacionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.TYPING_STOP, conversacionId);
    }
  }, []);

  // Conectar automáticamente cuando hay token y usuario (solo una vez)
  useEffect(() => {
    const hasInitializedRef = { current: false };
    
    if (token && user && !socketRef.current && !isConnecting && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      connect();
    }
  }, [token, user, isConnecting, connect]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    markManyAsRead,
    startTyping,
    stopTyping
  };
};
