import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification } from '../hooks/useNotifications';

// Tipos para eventos de notificaciones
interface NotificationEvents {
  onNewNotification?: (notification: Notification) => void;
  onScheduledNotification?: (notification: Notification) => void;
  onInactiveTrackingNotification?: (notification: Notification) => void;
  onNotificationMarkedRead?: (data: { notificacionId: string; timestamp: Date }) => void;
  onNotificationDeleted?: (data: { notificacionId: string; timestamp: Date }) => void;
  onAllNotificationsMarkedRead?: (data: { actualizadas: number; timestamp: Date }) => void;
  onNotificationError?: (error: { error: string; details: string }) => void;
}

// Tipos para el contexto
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  isLoading: boolean;
  markAsRead: (notificacionId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificacionId: string) => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  loadInitialNotifications: () => void;
  getNotificationsByType: (tipo: Notification['tipo']) => Notification[];
  getNotificationsByPriority: (prioridad: Notification['prioridad']) => Notification[];
  getUnreadNotifications: () => Notification[];
  getReadNotifications: () => Notification[];
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Props para el provider
interface NotificationProviderProps {
  children: ReactNode;
  events?: NotificationEvents;
}

// Provider del contexto
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  events = {} 
}) => {
  const notificationData = useNotifications(events);


  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook para usar el contexto
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Hook personalizado para notificaciones con eventos específicos
export const useNotificationEvents = (events: NotificationEvents) => {
  return useNotifications(events);
};
