import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { JwtPayload } from '../types';
import { 
  crearMensajeService, 
  marcarComoLeidoService
} from '../service/chats/mensajeService';
import { 
  crearConversacionService,
  obtenerConversacionesUsuarioService 
} from '../service/chats/conversacionService';
import { 
  crearNotificacionService,
  marcarNotificacionComoEnviadaService
} from '../service/chats/notificacionService';

import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Middleware de autenticación
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Token de autenticación requerido'));
        }

        // Usar TokenService en lugar de jwt.verify directamente
        const { TokenService } = await import('../utils/tokenService');
        const decoded = TokenService.verifyToken(token) as JwtPayload;
        
        if (!decoded) {
          return next(new Error('Token inválido'));
        }
        
        (socket as AuthenticatedSocket).userId = decoded.id;
        (socket as AuthenticatedSocket).userRole = decoded.role;
        
        next();
      } catch {
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const authenticatedSocket = socket as AuthenticatedSocket;

      // Guardar referencia del socket del usuario
      this.userSockets.set(authenticatedSocket.userId, socket.id);

      // Unir al usuario a su sala personal
      socket.join(`user:${authenticatedSocket.userId}`);

      // Evento: Usuario se une a una conversación
      socket.on('join_conversation', async (conversacionId: string) => {
        try {
          socket.join(`conversation:${conversacionId}`);

          // Nota: El marcado de leído debe hacerse por mensaje (ver evento mark_as_read)

          // Notificar a otros participantes
          socket.to(`conversation:${conversacionId}`).emit('user_joined_conversation', {
            userId: authenticatedSocket.userId,
            conversacionId
          });
        } catch {
          // silencioso
        }
      });

      // Evento: Usuario sale de una conversación
      socket.on('leave_conversation', (conversacionId: string) => {
        socket.leave(`conversation:${conversacionId}`);
      });

      // Evento: Enviar mensaje
      socket.on('send_message', async (data: {
        destinatario: string;
        contenido: string;
        tipo?: 'texto' | 'imagen' | 'archivo' | 'sistema';
        prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
        categoria?: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
        adjuntos?: Array<{
          nombre: string;
          url: string;
          tipo: string;
          tamano: number;
        }>;
        metadata?: {
          planEntrenamiento?: string;
          dieta?: string;
          sesion?: string;
          tags?: string[];
        };
        respuestaA?: string;
        // Si el cliente ya creó el mensaje por REST, puede enviar estos IDs para solo emitir
        mensajeId?: string;
        conversacionId?: string;
      }) => {
        try {
          // Modo broadcast de mensaje ya creado (evita doble creación en DB)
          if (data.mensajeId && data.conversacionId) {
            const now = new Date();
            const mensajeLigero = {
              _id: data.mensajeId,
              remitente: authenticatedSocket.userId,
              destinatario: data.destinatario,
              contenido: data.contenido,
              tipo: data.tipo || 'texto',
              estado: 'enviado' as const,
              prioridad: data.prioridad || 'normal',
              categoria: data.categoria || 'general',
              createdAt: now,
              updatedAt: now
            };

            this.io.to(`conversation:${data.conversacionId}`).emit('new_message', {
              mensaje: mensajeLigero,
              conversacionId: data.conversacionId
            });

            const destinatarioSocketId = this.userSockets.get(data.destinatario);
            if (destinatarioSocketId) {
              this.io.to(destinatarioSocketId).emit('message_notification', {
                mensaje: mensajeLigero,
                conversacionId: data.conversacionId,
                remitente: authenticatedSocket.userId
              });
            }

            return;
          }
          
          // Crear el mensaje en la base de datos
          const mensaje = await crearMensajeService({
            remitente: authenticatedSocket.userId,
            destinatario: data.destinatario,
            contenido: data.contenido,
            tipo: data.tipo || 'texto',
            prioridad: data.prioridad || 'normal',
            categoria: data.categoria || 'general',
            adjuntos: data.adjuntos || [],
            metadata: data.metadata,
            respuestaA: data.respuestaA
          });

          // Buscar conversación existente entre los usuarios
          const conversaciones = await obtenerConversacionesUsuarioService(authenticatedSocket.userId, 100);
          let conversacionActiva = conversaciones.find(c => 
            c.participantes.some(p => p._id === data.destinatario) &&
            c.participantes.length === 2 // Solo conversaciones de 2 personas
          );

          // Si no existe conversación, crear una nueva
          if (!conversacionActiva) {
            try {
              conversacionActiva = await crearConversacionService({
                participantes: [authenticatedSocket.userId, data.destinatario],
                metadata: { tipo: data.categoria === 'recordatorio' ? 'general' : (data.categoria || 'general') }
              });
            } catch {
              // Si falla la creación, intentar buscar la conversación nuevamente
              const conversacionesRetry = await obtenerConversacionesUsuarioService(authenticatedSocket.userId, 100);
              conversacionActiva = conversacionesRetry.find(c => 
                c.participantes.some(p => p._id === data.destinatario) &&
                c.participantes.length === 2
              );
              if (!conversacionActiva) {
                throw new Error('No se pudo crear ni encontrar la conversación');
              }
            }
          }

          // Emitir mensaje a todos los participantes de la conversación
          this.io.to(`conversation:${conversacionActiva._id}`).emit('new_message', {
            mensaje,
            conversacionId: conversacionActiva._id
          });

          // Emitir notificación al destinatario si no está en la conversación
          const destinatarioSocketId = this.userSockets.get(data.destinatario);
          if (destinatarioSocketId) {
            this.io.to(destinatarioSocketId).emit('message_notification', {
              mensaje,
              conversacionId: conversacionActiva._id,
              remitente: authenticatedSocket.userId
            });
          }

          // Crear notificación push
          try {
            await crearNotificacionService({
              usuario: data.destinatario,
              tipo: 'mensaje',
              titulo: 'Nuevo mensaje',
              contenido: `Tienes un nuevo mensaje: ${data.contenido.substring(0, 50)}${data.contenido.length > 50 ? '...' : ''}`,
              prioridad: data.prioridad || 'normal',
              accion: {
                tipo: 'abrir_mensaje',
                metadata: {
                  mensajeId: mensaje._id,
                  conversacionId: conversacionActiva._id
                }
              },
              metadata: {
                mensaje: mensaje._id,
                conversacion: conversacionActiva._id,
                remitente: authenticatedSocket.userId
              }
            });
          } catch {
            // silencioso
          }

        } catch (error) {
          socket.emit('message_error', {
            error: 'Error al enviar el mensaje',
            details: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      });

      // Evento: Marcar mensaje como leído
      socket.on('mark_as_read', async (mensajeId: string) => {
        try {
          await marcarComoLeidoService(mensajeId, authenticatedSocket.userId);
          
          // Notificar a otros participantes
          socket.broadcast.emit('message_read', {
            mensajeId,
            leidoPor: authenticatedSocket.userId,
            timestamp: new Date()
          });
        } catch {
          // silencioso
        }
      });

      // Evento: Marcar múltiples mensajes como leídos
      socket.on('mark_many_as_read', async (mensajeIds: string[]) => {
        try {
          const leidos: string[] = [];
          for (const id of mensajeIds) {
            try {
              await marcarComoLeidoService(id, authenticatedSocket.userId);
              leidos.push(id);
            } catch {
              // continuar con los demás
            }
          }
          if (leidos.length > 0) {
            // Notificar a otros participantes en un solo evento
            socket.broadcast.emit('messages_read', {
              mensajeIds: leidos,
              leidoPor: authenticatedSocket.userId,
              timestamp: new Date()
            });
          }
        } catch {
          // silencioso
        }
      });

      // Evento: Usuario está escribiendo
      socket.on('typing_start', (conversacionId: string) => {
        socket.to(`conversation:${conversacionId}`).emit('user_typing', {
          userId: authenticatedSocket.userId,
          conversacionId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (conversacionId: string) => {
        socket.to(`conversation:${conversacionId}`).emit('user_typing', {
          userId: authenticatedSocket.userId,
          conversacionId,
          isTyping: false
        });
      });

      // Evento: Usuario está en línea
      socket.on('user_online', () => {
        socket.broadcast.emit('user_status_change', {
          userId: authenticatedSocket.userId,
          status: 'online',
          timestamp: new Date()
        });
      });

      // ===== EVENTOS DE NOTIFICACIONES =====
      
      // Evento: Marcar notificación como leída
      socket.on('mark_notification_read', async (notificacionId: string) => {
        try {
          const { marcarComoLeidaService } = await import('../service/chats/notificacionService');
          await marcarComoLeidaService(notificacionId, authenticatedSocket.userId);
          
          // Confirmar al cliente
          socket.emit('notification_marked_read', {
            notificacionId,
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('notification_error', {
            error: 'Error al marcar notificación como leída',
            details: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      });

      // Evento: Marcar todas las notificaciones como leídas
      socket.on('mark_all_notifications_read', async () => {
        try {
          const { marcarTodasComoLeidasService } = await import('../service/chats/notificacionService');
          const result = await marcarTodasComoLeidasService(authenticatedSocket.userId);
          
          // Confirmar al cliente
          socket.emit('all_notifications_marked_read', {
            actualizadas: result.actualizadas,
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('notification_error', {
            error: 'Error al marcar todas las notificaciones como leídas',
            details: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      });

      // Evento: Eliminar notificación
      socket.on('delete_notification', async (notificacionId: string) => {
        try {
          const { eliminarNotificacionService } = await import('../service/chats/notificacionService');
          await eliminarNotificacionService(notificacionId, authenticatedSocket.userId);
          
          // Confirmar al cliente
          socket.emit('notification_deleted', {
            notificacionId,
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('notification_error', {
            error: 'Error al eliminar notificación',
            details: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      });

      // Evento: Desconexión
      socket.on('disconnect', () => {
        // Remover referencia del socket
        this.userSockets.delete(authenticatedSocket.userId);
        
        // Notificar a otros usuarios que está offline
        socket.broadcast.emit('user_status_change', {
          userId: authenticatedSocket.userId,
          status: 'offline',
          timestamp: new Date()
        });
      });
    });
  }

  // Método para enviar notificación a un usuario específico
  public sendToUser(userId: string, event: string, data: unknown) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Método para enviar a todos los usuarios
  public broadcast(event: string, data: unknown) {
    this.io.emit(event, data);
  }

  // Método para enviar a una sala específica
  public sendToRoom(room: string, event: string, data: unknown) {
    this.io.to(room).emit(event, data);
  }

  // Obtener el servidor IO para uso externo
  public getIO() {
    return this.io;
  }

  // ===== MÉTODOS DE NOTIFICACIONES =====

  // Enviar notificación en tiempo real a un usuario específico
  public async sendNotificationToUser(userId: string, notificacion: Record<string, unknown>) {
    try {
      // Enviar la notificación a través de WebSocket
      this.sendToUser(userId, 'new_notification', {
        notificacion,
        timestamp: new Date()
      });

      // Solo marcar como enviada si tiene _id (notificación guardada en BD)
      if (notificacion._id) {
        await marcarNotificacionComoEnviadaService(notificacion._id as string);
      }
    } catch (error) {
      console.error('Error al enviar notificación en tiempo real:', error);
    }
  }

  // Enviar notificación a múltiples usuarios
  public async sendNotificationToUsers(userIds: string[], notificacion: Record<string, unknown>) {
    const promises = userIds.map(userId => this.sendNotificationToUser(userId, notificacion));
    await Promise.allSettled(promises);
  }

  // Enviar notificación de recordatorio programado
  public async sendScheduledNotification(notificacion: Record<string, unknown>) {
    try {
      // Usar usuarioId (que es un string) en lugar de usuario (que puede ser un objeto)
      const userId = (notificacion.usuarioId || 
                     (typeof notificacion.usuario === 'object' && notificacion.usuario !== null 
                       ? (notificacion.usuario as Record<string, unknown>)._id 
                       : notificacion.usuario)) as string;

      // Enviar la notificación a través de WebSocket usando el mismo evento que las notificaciones normales
      this.sendToUser(userId, 'new_notification', {
        notificacion,
        timestamp: new Date()
      });

      // Marcar como enviada en la base de datos
      await marcarNotificacionComoEnviadaService(notificacion._id as string);
    } catch (error) {
      console.error('Error al enviar recordatorio en tiempo real:', error);
    }
  }

  // Enviar notificación de seguimiento inactivo
  public async sendInactiveTrackingNotification(notificacion: Record<string, unknown>) {
    try {
      // Usar usuarioId (que es un string) en lugar de usuario (que puede ser un objeto)
      const userId = (notificacion.usuarioId || 
                     (typeof notificacion.usuario === 'object' && notificacion.usuario !== null 
                       ? (notificacion.usuario as Record<string, unknown>)._id 
                       : notificacion.usuario)) as string;

      // Enviar la notificación a través de WebSocket
      this.sendToUser(userId, 'inactive_tracking_notification', {
        notificacion,
        timestamp: new Date()
      });

      // Marcar como enviada en la base de datos
      await marcarNotificacionComoEnviadaService(notificacion._id as string);
    } catch (error) {
      console.error('Error al enviar notificación de seguimiento inactivo:', error);
    }
  }

  // ===== MÉTODOS DE VALORACIONES =====

  // Enviar actualización de valoraciones a un trabajador específico
  public async sendValoracionUpdateToWorker(workerId: string, valoracionData: Record<string, unknown>) {
    try {
      this.sendToUser(workerId, 'valoracion_updated', {
        valoracion: valoracionData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error al enviar actualización de valoración al trabajador:', error);
    }
  }

  // Enviar actualización de estadísticas de valoraciones a un trabajador
  public async sendValoracionStatsUpdateToWorker(workerId: string, statsData: Record<string, unknown>) {
    try {
      this.sendToUser(workerId, 'valoracion_stats_updated', {
        estadisticas: statsData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error al enviar actualización de estadísticas de valoraciones:', error);
    }
  }

  // Enviar actualización de calificación promedio a todos los usuarios que vean al trabajador
  public async sendWorkerRatingUpdate(workerId: string, ratingData: Record<string, unknown>) {
    try {
      // Enviar a todos los usuarios conectados (ya que cualquier usuario puede ver las calificaciones)
      this.broadcast('worker_rating_updated', {
        workerId,
        rating: ratingData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error al enviar actualización de calificación del trabajador:', error);
    }
  }
}
