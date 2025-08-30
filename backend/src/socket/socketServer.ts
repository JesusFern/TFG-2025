import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { 
  crearMensajeService, 
  marcarComoLeidoService
} from '../service/chats/mensajeService';
import { 
  crearConversacionService,
  obtenerConversacionesUsuarioService 
} from '../service/chats/conversacionService';
import { crearNotificacionService } from '../service/chats/notificacionService';

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
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
      console.log(`Usuario ${authenticatedSocket.userId} conectado`);

      // Guardar referencia del socket del usuario
      this.userSockets.set(authenticatedSocket.userId, socket.id);

      // Unir al usuario a su sala personal
      socket.join(`user:${authenticatedSocket.userId}`);

      // Evento: Usuario se une a una conversación
      socket.on('join_conversation', async (conversacionId: string) => {
        try {
          socket.join(`conversation:${conversacionId}`);
          console.log(`Usuario ${authenticatedSocket.userId} se unió a la conversación ${conversacionId}`);
          
          // Marcar mensajes como leídos
          await marcarComoLeidoService(conversacionId, authenticatedSocket.userId);
          
          // Notificar a otros participantes
          socket.to(`conversation:${conversacionId}`).emit('user_joined_conversation', {
            userId: authenticatedSocket.userId,
            conversacionId
          });
        } catch (error) {
          console.error('Error al unirse a la conversación:', error);
        }
      });

      // Evento: Usuario sale de una conversación
      socket.on('leave_conversation', (conversacionId: string) => {
        socket.leave(`conversation:${conversacionId}`);
        console.log(`Usuario ${authenticatedSocket.userId} salió de la conversación ${conversacionId}`);
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
      }) => {
        try {
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

          // Buscar o crear conversación
          const conversacion = await obtenerConversacionesUsuarioService(authenticatedSocket.userId, 1);
          let conversacionActiva = conversacion.find(c => 
            c.participantes.some(p => p._id === data.destinatario)
          );

          if (!conversacionActiva) {
            conversacionActiva = await crearConversacionService({
              participantes: [authenticatedSocket.userId, data.destinatario],
              metadata: { tipo: data.categoria === 'recordatorio' ? 'general' : (data.categoria || 'general') }
            });
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

        } catch (error) {
          console.error('Error al enviar mensaje:', error);
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
        } catch (error) {
          console.error('Error al marcar mensaje como leído:', error);
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

      // Evento: Desconexión
      socket.on('disconnect', () => {
        console.log(`Usuario ${authenticatedSocket.userId} desconectado`);
        
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
}
