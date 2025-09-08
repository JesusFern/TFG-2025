// Interfaz para usuario resumido (solo campos necesarios para mensajería)
export interface UsuarioResumido {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

// Interfaz para adjuntos de mensajes
export interface Adjunto {
  nombre: string;
  url: string;
  tipo: string;
  tamano: number;
}

// Interfaz para metadatos de mensajes
export interface MetadataMensaje {
  planEntrenamiento?: string;
  dieta?: string;
  sesion?: string;
  ejercicio?: string;
  tags?: string[];
}

// Interfaz para metadatos de conversaciones
export interface MetadataConversacion {
  planEntrenamiento?: string;
  dieta?: string;
  tipo: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
  tags?: string[];
}

// Interfaz para configuración de conversaciones
export interface ConfiguracionConversacion {
  notificaciones: boolean;
  sonido: boolean;
  recordatorios: boolean;
}

// Interfaz para acciones de notificaciones
export interface AccionNotificacion {
  tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';
  url?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Interfaz para metadatos de notificaciones
export interface MetadataNotificacion {
  mensaje?: string;
  conversacion?: string;
  planEntrenamiento?: string;
  dieta?: string;
  sesion?: string;
  remitente?: string;
}

// Interfaz para mensajes
export interface IMensaje {
  _id: string;
  remitente: string;
  destinatario: string;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'archivo' | 'sistema';
  estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Adjunto[];
  metadata?: MetadataMensaje;
  respuestaA?: string;
  programadoPara?: Date;
  expiraEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para conversaciones
export interface IConversacion {
  _id: string;
  participantes: UsuarioResumido[];
  ultimoMensaje?: string;
  ultimoMensajeContenido?: string;
  ultimoMensajeFecha?: Date;
  ultimoMensajeRemitente?: string;
  mensajesNoLeidos: Map<string, number>;
  activa: boolean;
  metadata?: MetadataConversacion;
  configuracion?: ConfiguracionConversacion;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para notificaciones
export interface INotificacion {
  _id: string;
  usuario: string;
  tipo: 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  leida: boolean;
  enviada: boolean;
  accion?: AccionNotificacion;
  metadata?: MetadataNotificacion;
  programadoPara?: Date;
  expiraEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para crear/actualizar mensajes
export interface CrearMensajeData {
  remitente: string;
  destinatario: string;
  contenido: string;
  tipo?: 'texto' | 'imagen' | 'archivo' | 'sistema';
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Adjunto[];
  metadata?: MetadataMensaje;
  respuestaA?: string;
  programadoPara?: Date;
  expiraEn?: Date;
}

export interface ActualizarMensajeData {
  contenido?: string;
  estado?: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Adjunto[];
  metadata?: MetadataMensaje;
}

// Tipos para crear/actualizar conversaciones
export interface CrearConversacionData {
  participantes: string[];
  metadata?: MetadataConversacion;
  configuracion?: ConfiguracionConversacion;
}

export interface ActualizarConversacionData {
  participantes?: string[];
  metadata?: MetadataConversacion;
  configuracion?: ConfiguracionConversacion;
  activa?: boolean;
}

// Tipos para crear/actualizar notificaciones
export interface CrearNotificacionData {
  usuario: string;
  tipo: 'mensaje' | 'sistema' | 'recordatorio' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  accion?: AccionNotificacion;
  metadata?: MetadataNotificacion;
  programadoPara?: Date;
  expiraEn?: Date;
}

export interface ActualizarNotificacionData {
  titulo?: string;
  contenido?: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  leida?: boolean;
  enviada?: boolean;
  accion?: AccionNotificacion;
  metadata?: MetadataNotificacion;
}

// Tipos para filtros
export interface FiltrosMensajes {
  conversacionId?: string;
  remitente?: string;
  destinatario?: string;
  tipo?: string;
  estado?: string;
  categoria?: string;
  prioridad?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
  offset?: number;
}

export interface FiltrosConversaciones {
  participante?: string;
  activa?: boolean;
  tipo?: string;
  limit?: number;
  offset?: number;
}

export interface FiltrosNotificaciones {
  usuario?: string;
  tipo?: string;
  leida?: boolean;
  prioridad?: string;
  limit?: number;
  offset?: number;
}

// Tipos para respuestas de API
export interface RespuestaAPI<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Exportar los modelos
export { default as Mensaje } from './mensaje';
export { default as Conversacion } from './conversacion';
export { default as Notificacion } from './notificacion';
