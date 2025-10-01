import { apiRequest } from './api';
import { 
  Notificacion, 
  NotificacionesResponse, 
  NotificacionStats, 
  FiltrosNotificaciones, 
  CrearNotificacionData 
} from '../types/notifications';

export class NotificationService {
  // Obtener notificaciones del usuario
  static async getNotificaciones(filtros: FiltrosNotificaciones = {}): Promise<NotificacionesResponse> {
    const params = new URLSearchParams();
    
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.leida !== undefined) params.append('leida', filtros.leida.toString());
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros.limit) params.append('limit', filtros.limit.toString());
    if (filtros.offset) params.append('offset', filtros.offset.toString());

    const response = await apiRequest(`/api/messaging/notificaciones?${params.toString()}`);
    return await response.json();
  }

  // Obtener notificaciones no leídas
  static async getNotificacionesNoLeidas(): Promise<Notificacion[]> {
    const response = await apiRequest('/api/messaging/notificaciones/no-leidas');
    const data = await response.json();
    return data.notificaciones;
  }

  // Obtener una notificación específica
  static async getNotificacion(id: string): Promise<Notificacion> {
    const response = await apiRequest(`/api/messaging/notificaciones/${id}`);
    const data = await response.json();
    return data.notificacion;
  }

  // Marcar notificación como leída
  static async marcarComoLeida(id: string): Promise<void> {
    await apiRequest(`/api/messaging/notificaciones/${id}/leer`, { method: 'PUT' });
  }

  // Marcar todas las notificaciones como leídas
  static async marcarTodasComoLeidas(): Promise<void> {
    await apiRequest('/api/messaging/notificaciones/leer-todas', { method: 'PUT' });
  }

  // Eliminar una notificación
  static async eliminarNotificacion(id: string): Promise<void> {
    await apiRequest(`/api/messaging/notificaciones/${id}`, { method: 'DELETE' });
  }

  // Crear una notificación (solo para administradores)
  static async crearNotificacion(datos: CrearNotificacionData): Promise<Notificacion> {
    const response = await apiRequest('/api/messaging/notificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const data = await response.json();
    return data.notificacion;
  }

  // Obtener estadísticas de notificaciones
  static async getEstadisticas(): Promise<NotificacionStats> {
    const [notificacionesResponse, noLeidasResponse] = await Promise.all([
      this.getNotificaciones({ limit: 1000 }), // Obtener todas para calcular stats
      this.getNotificacionesNoLeidas()
    ]);

    const notificaciones = notificacionesResponse.notificaciones;
    const noLeidas = noLeidasResponse.length;

    // Calcular estadísticas por tipo
    const porTipo = notificaciones.reduce((acc, notif) => {
      acc[notif.tipo] = (acc[notif.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular estadísticas por prioridad
    const porPrioridad = notificaciones.reduce((acc, notif) => {
      acc[notif.prioridad] = (acc[notif.prioridad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: notificaciones.length,
      noLeidas,
      porTipo: {
        mensaje: porTipo.mensaje || 0,
        sistema: porTipo.sistema || 0,
        recordatorio: porTipo.recordatorio || 0,
        entrenamiento: porTipo.entrenamiento || 0,
        nutricion: porTipo.nutricion || 0,
      },
      porPrioridad: {
        baja: porPrioridad.baja || 0,
        normal: porPrioridad.normal || 0,
        alta: porPrioridad.alta || 0,
        urgente: porPrioridad.urgente || 0,
      }
    };
  }

  // Contar notificaciones no leídas (método rápido)
  static async contarNoLeidas(): Promise<number> {
    const notificaciones = await this.getNotificacionesNoLeidas();
    return notificaciones.length;
  }
}

export default NotificationService;
