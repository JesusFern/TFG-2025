// Tipos para notificaciones en el frontend
export interface Notificacion {
  _id: string;
  usuario: string;
  tipo: 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  leida: boolean;
  enviada: boolean;
  accion?: {
    tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';
    url?: string;
    metadata?: Record<string, string | number | boolean>;
  };
  metadata?: {
    mensaje?: string;
    conversacion?: string;
    planEntrenamiento?: string;
    dieta?: string;
    sesion?: string;
    remitente?: string;
  };
  programadaPara?: string;
  expiraEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  limit: number;
  offset: number;
}

export interface NotificacionStats {
  total: number;
  noLeidas: number;
  porTipo: {
    mensaje: number;
    sistema: number;
    recordatorio: number;
    entrenamiento: number;
    nutricion: number;
  };
  porPrioridad: {
    baja: number;
    normal: number;
    alta: number;
    urgente: number;
  };
}

export interface FiltrosNotificaciones {
  tipo?: string;
  leida?: boolean;
  prioridad?: string;
  limit?: number;
  offset?: number;
}

export interface CrearNotificacionData {
  usuario: string;
  tipo: 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  accion?: {
    tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';
    url?: string;
    metadata?: Record<string, string | number | boolean>;
  };
  metadata?: {
    mensaje?: string;
    conversacion?: string;
    planEntrenamiento?: string;
    dieta?: string;
    sesion?: string;
    remitente?: string;
  };
  programadaPara?: string;
  expiraEn?: string;
}

// Tipos para acciones de notificaciones
export type AccionNotificacion = 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';

// Tipos para prioridades
export type PrioridadNotificacion = 'baja' | 'normal' | 'alta' | 'urgente';

// Tipos para tipos de notificación
export type TipoNotificacion = 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';

// Configuración de notificaciones del usuario
export interface ConfiguracionNotificaciones {
  notificacionesGenerales: boolean;
  notificacionesMensajes: boolean;
  notificacionesCitas: boolean;
  notificacionesPlanes: boolean;
  notificacionesDietas: boolean;
  notificacionesRecordatorios: boolean;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  notificacionesSonido: boolean;
}

// Props para componentes de notificaciones
export interface NotificationBellProps {
  onNotificationClick?: (notificacion: Notificacion) => void;
  onViewAllClick?: () => void;
  showCount?: boolean;
  maxVisible?: number;
}

export interface NotificationItemProps {
  notificacion: Notificacion;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (accion: Notificacion['accion']) => void;
  compact?: boolean;
}

export interface NotificationListProps {
  notificaciones: Notificacion[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (accion: Notificacion['accion']) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  compact?: boolean;
}

export interface NotificationFiltersProps {
  filtros: FiltrosNotificaciones;
  onFiltersChange: (filtros: FiltrosNotificaciones) => void;
  stats?: NotificacionStats;
}
