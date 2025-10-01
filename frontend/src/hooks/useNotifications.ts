import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../config/socket';
import { chatService } from '../services/chatService';
import { Notificacion } from '../types/notifications';

// Alias para mantener compatibilidad con el código existente
export type Notification = Notificacion;

// Tipos para los eventos de notificaciones
interface NotificationEvents {
  onNewNotification?: (notification: Notification) => void;
  onScheduledNotification?: (notification: Notification) => void;
  onInactiveTrackingNotification?: (notification: Notification) => void;
  onNotificationMarkedRead?: (data: { notificacionId: string; timestamp: Date }) => void;
  onNotificationDeleted?: (data: { notificacionId: string; timestamp: Date }) => void;
  onAllNotificationsMarkedRead?: (data: { actualizadas: number; timestamp: Date }) => void;
  onNotificationError?: (error: { error: string; details: string }) => void;
}

export const useNotifications = (events: NotificationEvents = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const eventsRef = useRef(events);
  const hasLoadedRef = useRef(false); // Flag para evitar cargas múltiples
  const isLoadingRef = useRef(false); // Ref para evitar dependencias circulares

  // Actualizar eventsRef cuando events cambie
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);


  // Usar el hook de socket con eventos de notificaciones
  const { socket, isConnected, isConnecting, connectionError } = useSocket({
    onNewNotification: (data: { notificacion: unknown; timestamp: Date }) => {
      const notificacion = data.notificacion as Notification;
      setNotifications(prev => [notificacion, ...prev]);
      if (!notificacion.leida) {
        setUnreadCount(prev => prev + 1);
      }
      eventsRef.current.onNewNotification?.(notificacion);
    },
    onScheduledNotification: (data: { notificacion: unknown; timestamp: Date }) => {
      const notificacion = data.notificacion as Notification;
      setNotifications(prev => [notificacion, ...prev]);
      if (!notificacion.leida) {
        setUnreadCount(prev => prev + 1);
      }
      eventsRef.current.onScheduledNotification?.(notificacion);
    },
    onInactiveTrackingNotification: (data: { notificacion: unknown; timestamp: Date }) => {
      const notificacion = data.notificacion as Notification;
      setNotifications(prev => [notificacion, ...prev]);
      if (!notificacion.leida) {
        setUnreadCount(prev => prev + 1);
      }
      eventsRef.current.onInactiveTrackingNotification?.(notificacion);
    },
    onNotificationMarkedRead: (data: { notificacionId: string; timestamp: Date }) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === data.notificacionId 
            ? { ...notif, leida: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      eventsRef.current.onNotificationMarkedRead?.(data);
    },
    onNotificationDeleted: (data: { notificacionId: string; timestamp: Date }) => {
      setNotifications(prev => {
        const deletedNotif = prev.find(notif => notif._id === data.notificacionId);
        const newNotifications = prev.filter(notif => notif._id !== data.notificacionId);
        if (deletedNotif && !deletedNotif.leida) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return newNotifications;
      });
      eventsRef.current.onNotificationDeleted?.(data);
    },
    onAllNotificationsMarkedRead: (data: { actualizadas: number; timestamp: Date }) => {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, leida: true }))
      );
      setUnreadCount(0);
      eventsRef.current.onAllNotificationsMarkedRead?.(data);
    },
    onNotificationError: (error: { error: string; details: string }) => {
      console.error('useNotifications: Error en notificación:', error);
      eventsRef.current.onNotificationError?.(error);
    }
  });
  
  // Log del estado de conexión

  // Cargar notificaciones iniciales
  const loadInitialNotifications = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current || hasLoadedRef.current) return;
    
    hasLoadedRef.current = true;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await chatService.notificaciones.obtenerNotificaciones({ limit: 50 });
      
      // Convertir las notificaciones del backend al formato del frontend
      const convertedNotifications = response.notificaciones.map((notif: unknown) => {
        const notifData = notif as Record<string, unknown>;
        return {
          ...notifData,
          programadaPara: notifData.programadaPara ? new Date(notifData.programadaPara as string) : undefined,
          expiraEn: notifData.expiraEn ? new Date(notifData.expiraEn as string) : undefined,
          createdAt: new Date(notifData.createdAt as string),
          updatedAt: new Date(notifData.updatedAt as string)
        } as Notification;
      });
      
      setNotifications(convertedNotifications);
      
      // Calcular notificaciones no leídas
      const unread = convertedNotifications.filter((notif: Notification) => !notif.leida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('useNotifications: Error al cargar notificaciones iniciales:', error);
      hasLoadedRef.current = false; // Resetear en caso de error para permitir reintentos
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []); // ✅ Sin dependencias - la función es estable

  // Cargar notificaciones iniciales cuando se conecte el socket
  useEffect(() => {
    if (isConnected && !hasLoadedRef.current) {
      loadInitialNotifications();
    }
  }, [isConnected, loadInitialNotifications]); // ✅ loadInitialNotifications es estable ahora


  // Marcar notificación como leída
  const markAsRead = useCallback((notificacionId: string) => {
    // Actualizar el estado local inmediatamente para mejor UX
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificacionId 
          ? { ...notif, leida: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    if (socket?.connected) {
      console.log('useNotifications: Marcando notificación como leída:', notificacionId);
      socket.emit(SOCKET_EVENTS.MARK_NOTIFICATION_READ, notificacionId);
    } else {
      console.warn('useNotifications: No se puede marcar como leída - socket no conectado');
    }
  }, [socket]);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(() => {
    // Actualizar el estado local inmediatamente para mejor UX
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
    setUnreadCount(0);
    
    if (socket?.connected) {
      console.log('useNotifications: Marcando todas las notificaciones como leídas');
      socket.emit(SOCKET_EVENTS.MARK_ALL_NOTIFICATIONS_READ);
    } else {
      console.warn('useNotifications: No se puede marcar todas como leídas - socket no conectado');
    }
  }, [socket]);

  // Eliminar notificación
  const deleteNotification = useCallback((notificacionId: string) => {
    if (socket?.connected) {
      console.log('useNotifications: Eliminando notificación:', notificacionId);
      socket.emit(SOCKET_EVENTS.DELETE_NOTIFICATION, notificacionId);
    } else {
      console.warn('useNotifications: No se puede eliminar - socket no conectado');
    }
  }, [socket]);

  // Agregar notificación manualmente (para testing o casos especiales)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.leida) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Función para agregar notificación de prueba (para debugging)

  // Limpiar notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Obtener notificaciones por tipo
  const getNotificationsByType = useCallback((tipo: Notification['tipo']) => {
    return notifications.filter(notif => notif.tipo === tipo);
  }, [notifications]);

  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = useCallback((prioridad: Notification['prioridad']) => {
    return notifications.filter(notif => notif.prioridad === prioridad);
  }, [notifications]);

  // Obtener notificaciones no leídas
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.leida);
  }, [notifications]);

  // Obtener notificaciones leídas
  const getReadNotifications = useCallback(() => {
    return notifications.filter(notif => notif.leida);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    connectionError,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearNotifications,
    loadInitialNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getReadNotifications
  };
};