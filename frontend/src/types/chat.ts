export interface Mensaje {
  _id: string;
  remitente: UsuarioResumido;
  destinatario: UsuarioResumido;
  contenido: string;
  estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Adjunto[];
  metadata?: MetadataMensaje;
  respuestaA?: MensajeResumido;
  leidoEn?: Date;
  archivadoEn?: Date;
  programadoPara?: Date;
  expiraEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversacion {
  _id: string;
  participantes: UsuarioResumido[];
  ultimoMensaje?: string;
  ultimoMensajeContenido?: string;
  ultimoMensajeFecha?: Date;
  ultimoMensajeRemitente?: UsuarioResumido;
  mensajesNoLeidos: Record<string, number>;
  activa: boolean;
  metadata?: MetadataConversacion;
  configuracion?: ConfiguracionConversacion;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notificacion {
  _id: string;
  usuario: string;
  tipo: 'mensaje' | 'recordatorio' | 'sistema' | 'entrenamiento' | 'nutricion';
  titulo: string;
  contenido: string;
  leida: boolean;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  accion?: AccionNotificacion;
  metadata?: MetadataNotificacion;
  programadaPara?: Date;
  expiraEn?: Date;
  enviada: boolean;
  enviadaEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsuarioResumido {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string | null;
  role: 'admin' | 'worker' | 'user';
}

export interface Adjunto {
  nombre: string;
  url: string;
  tipo: string;
  tamano: number;
}

export interface MetadataMensaje {
  planEntrenamiento?: PlanResumido;
  dieta?: DietaResumida;
  sesion?: SesionResumida;
  tags?: string[];
}

export interface MetadataConversacion {
  planEntrenamiento?: PlanResumido;
  dieta?: DietaResumida;
  tipo: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
  tags?: string[];
}

export interface MetadataNotificacion {
  mensaje?: string;
  conversacion?: string;
  planEntrenamiento?: string;
  dieta?: string;
  sesion?: string;
  remitente?: string;
}

export interface PlanResumido {
  _id: string;
  nombre: string;
}

export interface DietaResumida {
  _id: string;
  nombre: string;
}

export interface SesionResumida {
  _id: string;
  tipoEntrenamiento: string;
  fecha: string;
}

export interface MensajeResumido {
  _id: string;
  contenido: string;
}

export interface ConfiguracionConversacion {
  notificaciones: boolean;
  sonido: boolean;
  recordatorios: boolean;
}

export interface AccionNotificacion {
  tipo: 'navegar' | 'abrir_mensaje' | 'abrir_conversacion' | 'abrir_plan' | 'abrir_dieta';
  url?: string;
  metadata?: Record<string, unknown>;
}

// DTOs para crear/actualizar
export interface CrearMensajeDTO {
  destinatario: string;
  contenido: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  adjuntos?: Adjunto[];
  metadata?: Omit<MetadataMensaje, 'planEntrenamiento' | 'dieta' | 'sesion'> & {
    planEntrenamiento?: string;
    dieta?: string;
    sesion?: string;
  };
  respuestaA?: string;
  programadoPara?: Date;
  expiraEn?: Date;
}

export interface CrearConversacionDTO {
  participantes: string[];
  metadata?: {
    planEntrenamiento?: string;
    dieta?: string;
    tipo?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
    tags?: string[];
  };
  configuracion?: ConfiguracionConversacion;
}

export interface ActualizarConversacionDTO {
  activa?: boolean;
  metadata?: Partial<MetadataConversacion>;
  configuracion?: Partial<ConfiguracionConversacion>;
}

// Filtros para consultas
export interface FiltrosMensajes {
  conversacionId?: string;
  remitente?: string;
  destinatario?: string;
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
  tipo?: string;
  activa?: boolean;
  limit?: number;
  offset?: number;
}

export interface FiltrosNotificaciones {
  tipo?: string;
  leida?: boolean;
  prioridad?: string;
  limit?: number;
  offset?: number;
}

// Respuestas de la API
export interface ApiMensajeResponse {
  mensaje: Mensaje;
  message?: string;
}

export interface ApiConversacionResponse {
  conversacion: Conversacion;
  message?: string;
}

export interface ApiNotificacionResponse {
  notificacion: Notificacion;
  message?: string;
}

export interface ApiMensajesResponse {
  mensajes: Mensaje[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}

export interface ApiConversacionesResponse {
  conversaciones: Conversacion[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}

export interface ApiNotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}

// Estados para el frontend
export interface EstadoMensajeria {
  conversaciones: Conversacion[];
  conversacionActiva: Conversacion | null;
  mensajes: Mensaje[];
  notificaciones: Notificacion[];
  cargando: boolean;
  error: string | null;
}

// Acciones para el contexto
export interface AccionesMensajeria {
  enviarMensaje: (dto: CrearMensajeDTO) => Promise<Mensaje>;
  obtenerConversaciones: () => Promise<Conversacion[]>;
  obtenerMensajes: (conversacionId: string) => Promise<Mensaje[]>;
  marcarComoLeido: (mensajeId: string) => Promise<void>;
  marcarNotificacionComoLeida: (notificacionId: string) => Promise<void>;
  crearConversacion: (dto: CrearConversacionDTO) => Promise<Conversacion>;
  actualizarConversacion: (id: string, dto: ActualizarConversacionDTO) => Promise<Conversacion>;
}
