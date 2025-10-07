// Configuración del socket
export const SOCKET_CONFIG = {
  // URL del backend - En local y Docker (expuesto en localhost:5000)
  url: 'http://localhost:5000',
  
  // Opciones de conexión
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false, // No conectar automáticamente
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
    withCredentials: true,
  }
};

// Eventos del socket
export const SOCKET_EVENTS = {
  // Eventos de conexión
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Eventos de mensajería
  NEW_MESSAGE: 'new_message',
  MESSAGE_NOTIFICATION: 'message_notification',
  MESSAGE_ERROR: 'message_error',
  
  // Eventos de usuario
  USER_TYPING: 'user_typing',
  USER_JOINED_CONVERSATION: 'user_joined_conversation',
  USER_STATUS_CHANGE: 'user_status_change',
  USER_ONLINE: 'user_online',
  
  // Eventos de mensajes
  MESSAGE_READ: 'message_read',
  MESSAGES_READ: 'messages_read',
  
  // Eventos de conversación
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  
  // Eventos de envío
  SEND_MESSAGE: 'send_message',
  MARK_AS_READ: 'mark_as_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Eventos de notificaciones
  NEW_NOTIFICATION: 'new_notification',
  SCHEDULED_NOTIFICATION: 'scheduled_notification',
  INACTIVE_TRACKING_NOTIFICATION: 'inactive_tracking_notification',
  NOTIFICATION_MARKED_READ: 'notification_marked_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  NOTIFICATION_ERROR: 'notification_error',
  ALL_NOTIFICATIONS_MARKED_READ: 'all_notifications_marked_read',
  
  // Eventos de notificaciones (enviar)
  MARK_NOTIFICATION_READ: 'mark_notification_read',
  MARK_ALL_NOTIFICATIONS_READ: 'mark_all_notifications_read',
  DELETE_NOTIFICATION: 'delete_notification',
  
  // Eventos de valoraciones
  VALORACION_UPDATED: 'valoracion_updated',
  VALORACION_STATS_UPDATED: 'valoracion_stats_updated',
  WORKER_RATING_UPDATED: 'worker_rating_updated'
};
