import { apiRequest } from './api';
import { 
  Mensaje, 
  Conversacion, 
  Notificacion,
  CrearMensajeDTO,
  CrearConversacionDTO,
  ActualizarConversacionDTO,
  FiltrosMensajes,
  FiltrosConversaciones,
  FiltrosNotificaciones,
  ApiMensajeResponse,
  ApiConversacionResponse,
  ApiNotificacionResponse,
  ApiMensajesResponse,
  ApiConversacionesResponse,
  ApiNotificacionesResponse,
  UsuarioResumido
} from '../types/chat';

// Servicio para mensajes
export const mensajeService = {
  // Crear un nuevo mensaje
  async crearMensaje(data: CrearMensajeDTO): Promise<Mensaje> {
    const response = await apiRequest('/api/messaging/mensajes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear mensaje: ${response.status} ${response.statusText} - ${errorData.message || 'Error desconocido'}`);
    }
    
    const responseData = await response.json() as ApiMensajeResponse;
    
    if (!responseData.mensaje) {
      throw new Error('El backend no devolvió el mensaje creado');
    }
    
    return responseData.mensaje;
  },

  // Obtener mensajes con filtros
  async obtenerMensajes(filtros: FiltrosMensajes = {}): Promise<{
    mensajes: Mensaje[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filtros.conversacionId) queryParams.append('conversacionId', filtros.conversacionId);
    if (filtros.remitente) queryParams.append('remitente', filtros.remitente);
    if (filtros.destinatario) queryParams.append('destinatario', filtros.destinatario);
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.estado) queryParams.append('estado', filtros.estado);
    if (filtros.categoria) queryParams.append('categoria', filtros.categoria);
    if (filtros.prioridad) queryParams.append('prioridad', filtros.prioridad);
    if (filtros.fechaDesde) queryParams.append('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta) queryParams.append('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
    if (filtros.offset) queryParams.append('offset', filtros.offset.toString());

    const response = await apiRequest(`/api/messaging/mensajes?${queryParams.toString()}`);
    const responseData = await response.json() as ApiMensajesResponse;
    return responseData;
  },

  // Obtener mensaje por ID
  async obtenerMensajePorId(mensajeId: string): Promise<Mensaje> {
    const response = await apiRequest(`/api/messaging/mensajes/${mensajeId}`);
    const responseData = await response.json() as ApiMensajeResponse;
    return responseData.mensaje;
  },

  // Marcar mensaje como leído
  async marcarComoLeido(mensajeId: string): Promise<void> {
    await apiRequest(`/api/messaging/mensajes/${mensajeId}/leer`, {
      method: 'PATCH'
    });
  },

  // Eliminar mensaje
  async eliminarMensaje(mensajeId: string): Promise<void> {
    await apiRequest(`/api/messaging/mensajes/${mensajeId}`, {
      method: 'DELETE'
    });
  },

  // Obtener mensajes no leídos
  async obtenerMensajesNoLeidos(): Promise<Mensaje[]> {
    const response = await apiRequest('/api/messaging/mensajes/no-leidos');
    const responseData = await response.json() as ApiMensajesResponse;
    return responseData.mensajes;
  }
};

// Servicio para conversaciones
export const conversacionService = {
  // Crear nueva conversación
  async crearConversacion(data: CrearConversacionDTO): Promise<Conversacion> {
    const response = await apiRequest('/api/messaging/conversaciones', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear conversación: ${response.status} ${response.statusText} - ${errorData.message || 'Error desconocido'}`);
    }
    
    const responseData = await response.json() as ApiConversacionResponse;
    
    if (!responseData.conversacion) {
      throw new Error('El backend no devolvió la conversación creada');
    }
    
    return responseData.conversacion;
  },

  // Obtener conversaciones con filtros
  async obtenerConversaciones(filtros: FiltrosConversaciones = {}): Promise<{
    conversaciones: Conversacion[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filtros.participante) queryParams.append('participante', filtros.participante);
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.activa !== undefined) queryParams.append('activa', filtros.activa.toString());
    if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
    if (filtros.offset) queryParams.append('offset', filtros.offset.toString());

    const response = await apiRequest(`/api/messaging/conversaciones?${queryParams.toString()}`);
    const responseData = await response.json() as ApiConversacionesResponse;
    return responseData;
  },

  // Obtener conversación por ID
  async obtenerConversacionPorId(conversacionId: string): Promise<Conversacion> {
    const response = await apiRequest(`/api/messaging/conversaciones/${conversacionId}`);
    const responseData = await response.json() as ApiConversacionResponse;
    return responseData.conversacion;
  },

  // Actualizar conversación
  async actualizarConversacion(
    conversacionId: string, 
    data: ActualizarConversacionDTO
  ): Promise<Conversacion> {
    const response = await apiRequest(`/api/messaging/conversaciones/${conversacionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    const responseData = await response.json() as ApiConversacionResponse;
    return responseData.conversacion;
  },

  // Archivar conversación
  async archivarConversacion(conversacionId: string): Promise<void> {
    await apiRequest(`/api/messaging/conversaciones/${conversacionId}/archivar`, {
      method: 'PATCH'
    });
  },

  // Obtener conversaciones de un usuario
  async obtenerConversacionesUsuario(usuarioId: string, limit = 20): Promise<Conversacion[]> {
    
      const response = await apiRequest(`/api/messaging/conversaciones/by-user/${usuarioId}?limit=${limit}`);
      
      if (!response.ok) {
        await response.text();
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json() as ApiConversacionesResponse;
      
      const conversaciones = responseData.conversaciones || [];
      
      // Validar que las conversaciones tengan la estructura correcta
      const conversacionesValidadas = conversaciones.filter(conv => {
        if (!conv || !conv._id || !conv.participantes) {
          return false;
        }
        
        // Validar que los participantes tengan la estructura correcta
        if (!Array.isArray(conv.participantes)) {
          return false;
        }
        
        // Verificar que cada participante tenga _id y fullName
        const participantesValidos = conv.participantes.every(p => {
          if (!p) return false;
          if (typeof p === 'string') {
            // Si es un string, convertirlo a objeto
            conv.participantes = conv.participantes.map(participant => 
              typeof participant === 'string' 
                ? { _id: participant, fullName: 'Usuario', email: '', role: 'user' }
                : participant
            );
            return true;
          }
          return p._id && p.fullName;
        });
        
        if (!participantesValidos) {
          return false;
        }
        
      return true;
    });
    return conversacionesValidadas;
    
  },

  // Obtener conversación entre dos usuarios
  async obtenerConversacionEntreUsuarios(usuario1: string, usuario2: string): Promise<Conversacion | null> {
    const queryParams = new URLSearchParams();
    queryParams.append('usuario1', usuario1);
    queryParams.append('usuario2', usuario2);
    
    const response = await apiRequest(`/messaging/conversaciones/entre-usuarios?${queryParams.toString()}`);
    const responseData = await response.json() as ApiConversacionResponse;
    return responseData.conversacion || null;
  },

  // Obtener estadísticas de conversaciones
  async obtenerEstadisticasConversaciones(usuarioId: string): Promise<{
    totalConversaciones: number;
    conversacionesActivas: number;
    totalMensajesNoLeidos: number;
    conversacionesPorTipo: Record<string, number>;
  }> {
    const response = await apiRequest(`/messaging/conversaciones/estadisticas/${usuarioId}`);
    const responseData = await response.json();
    return responseData;
  }
};

// Servicio para notificaciones
export const notificacionService = {
  // Crear nueva notificación
  async crearNotificacion(data: Record<string, unknown>): Promise<Notificacion> {
    const response = await apiRequest('/api/messaging/notificaciones', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const responseData = await response.json() as ApiNotificacionResponse;
    return responseData.notificacion;
  },

  // Obtener notificaciones con filtros
  async obtenerNotificaciones(filtros: FiltrosNotificaciones = {}): Promise<{
    notificaciones: Notificacion[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
    if (filtros.leida !== undefined) queryParams.append('leida', filtros.leida.toString());
    if (filtros.prioridad) queryParams.append('prioridad', filtros.prioridad);
    if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
    if (filtros.offset) queryParams.append('offset', filtros.offset.toString());

    const response = await apiRequest(`/api/messaging/notificaciones?${queryParams.toString()}`);
    const responseData = await response.json() as ApiNotificacionesResponse;
    return responseData;
  },

  // Obtener notificación por ID
  async obtenerNotificacionPorId(notificacionId: string): Promise<Notificacion> {
    const response = await apiRequest(`/api/messaging/notificaciones/${notificacionId}`);
    const responseData = await response.json() as ApiNotificacionResponse;
    return responseData.notificacion;
  },

  // Marcar notificación como leída
  async marcarComoLeida(notificacionId: string): Promise<void> {
    await apiRequest(`/api/messaging/notificaciones/${notificacionId}/leer`, {
      method: 'PUT'
    });
  },

  // Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(): Promise<void> {
    await apiRequest('/api/messaging/notificaciones/marcar-todas-leidas', {
      method: 'PUT'
    });
  },

  // Eliminar notificación
  async eliminarNotificacion(notificacionId: string): Promise<void> {
    await apiRequest(`/api/messaging/notificaciones/${notificacionId}`, {
      method: 'DELETE'
    });
  },

  // Obtener notificaciones no leídas
  async obtenerNotificacionesNoLeidas(): Promise<Notificacion[]> {
    const response = await apiRequest('/api/messaging/notificaciones/no-leidas');
    const responseData = await response.json() as ApiNotificacionesResponse;
    return responseData.notificaciones;
  },

  // Contar notificaciones no leídas
  async contarNotificacionesNoLeidas(): Promise<number> {
    const response = await apiRequest('/api/messaging/notificaciones/contar-no-leidas');
    const responseData = await response.json();
    return responseData.count;
  },

  // Obtener notificaciones del sistema
  async obtenerNotificacionesSistema(): Promise<Notificacion[]> {
    const response = await apiRequest('/api/messaging/notificaciones/sistema');
    const responseData = await response.json() as ApiNotificacionesResponse;
    return responseData.notificaciones;
  }
};

// Servicio principal del chat
export const chatService = {
  mensajes: mensajeService,
  conversaciones: conversacionService,
  notificaciones: notificacionService,

  // Servicio de usuarios
  users: {
    async getAllUsers(): Promise<UsuarioResumido[]> {
      const response = await apiRequest('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al obtener usuarios: ${response.status} ${response.statusText} - ${errorData.message || 'Error desconocido'}`);
      }
      
      const responseData = await response.json();
      
      if (!Array.isArray(responseData)) {
        throw new Error('El backend no devolvió una lista de usuarios válida');
      }
      
      return responseData.map((u: { _id: string; fullName: string; email: string; profilePicture?: string | null; role: string }) => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        profilePicture: u.profilePicture,
        role: u.role as 'admin' | 'worker' | 'user'
      }));
    }
  },

  // Métodos de conveniencia
  async obtenerConversacionCompleta(conversacionId: string): Promise<{
    conversacion: Conversacion;
    mensajes: Mensaje[];
  }> {
    const [conversacion, mensajesResponse] = await Promise.all([
      conversacionService.obtenerConversacionPorId(conversacionId),
      mensajeService.obtenerMensajes({ conversacionId, limit: 100 })
    ]);

    return {
      conversacion,
      mensajes: mensajesResponse.mensajes
    };
  },

  async enviarMensajeYActualizarConversacion(
    conversacionId: string,
    mensajeData: CrearMensajeDTO
  ): Promise<{
    mensaje: Mensaje;
    conversacion: Conversacion;
  }> {
    const [mensaje, conversacion] = await Promise.all([
      mensajeService.crearMensaje(mensajeData),
      conversacionService.obtenerConversacionPorId(conversacionId)
    ]);

    return { mensaje, conversacion };
  }
};
