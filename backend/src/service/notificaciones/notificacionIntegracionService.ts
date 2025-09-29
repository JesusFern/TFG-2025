import { socketServer } from '../../server';
import {
  crearNotificacionService,
  notificarMensajeChatService
} from '../chats/notificacionService';
import logger from '../../utils/logger';

/**
 * Servicio de integración para conectar notificaciones con los módulos del sistema
 */
export class NotificacionIntegracionService {
  private static instance: NotificacionIntegracionService;

  private constructor() {}

  public static getInstance(): NotificacionIntegracionService {
    if (!NotificacionIntegracionService.instance) {
      NotificacionIntegracionService.instance = new NotificacionIntegracionService();
    }
    return NotificacionIntegracionService.instance;
  }

  /**
   * Notificar cuando se publica una dieta
   */
  public async notificarDietaPublicada(
    clienteId: string,
    nutricionistaId: string,
    dietaId: string,
    nombreDieta: string
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'nutricion' as const,
        titulo: 'Nueva dieta disponible',
        contenido: `Tu nutricionista ha publicado una nueva dieta: "${nombreDieta}". ¡Revisa tu plan nutricional!`,
        prioridad: 'alta' as const,
        accion: {
          tipo: 'abrir_dieta' as const,
          metadata: { dietaId }
        },
        metadata: {
          dieta: dietaId,
          remitente: nutricionistaId
        }
      };

      // Crear notificación en la base de datos
      await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Notificación de dieta publicada enviada en tiempo real a ${clienteId}`);
      }
    } catch (error) {
      logger.error('Error al notificar dieta publicada:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se publica un plan de entrenamiento
   */
  public async notificarPlanPublicado(
    clienteId: string,
    entrenadorId: string,
    planId: string,
    nombrePlan: string
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'entrenamiento' as const,
        titulo: 'Nuevo plan de entrenamiento disponible',
        contenido: `Tu entrenador ha publicado un nuevo plan: "${nombrePlan}". ¡Comienza tu rutina!`,
        prioridad: 'alta' as const,
        accion: {
          tipo: 'abrir_plan' as const,
          metadata: { planId }
        },
        metadata: {
          planEntrenamiento: planId,
          remitente: entrenadorId
        }
      };

      // Crear notificación en la base de datos
      await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Notificación de plan publicado enviada en tiempo real a ${clienteId}`);
      }
    } catch (error) {
      logger.error('Error al notificar plan publicado:', error);
      throw error;
    }
  }


  /**
   * Notificar cuando se confirma una cita
   */
  public async notificarCitaConfirmada(
    clienteId: string,
    profesionalId: string,
    profesionalNombre: string,
    citaId: string,
    fechaCita: string
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'sistema' as const,
        titulo: 'Cita confirmada',
        contenido: `${profesionalNombre} ha confirmado tu cita para el ${fechaCita}. ¡Nos vemos pronto!`,
        prioridad: 'normal' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/citas',
          metadata: { citaId }
        },
        metadata: {
          remitente: profesionalId
        }
      };

      // Crear notificación en la base de datos
      await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Notificación de cita confirmada enviada en tiempo real a ${clienteId}`);
      }
    } catch (error) {
      logger.error('Error al notificar cita confirmada:', error);
      throw error;
    }
  }


  /**
   * Notificar mensaje en chat
   */
  public async notificarMensajeChat(
    destinatarioId: string,
    remitenteId: string,
    remitenteNombre: string,
    mensajeId: string,
    conversacionId: string,
    contenido: string
  ): Promise<void> {
    try {
      // Crear notificación en la base de datos
      await notificarMensajeChatService(destinatarioId, remitenteId, remitenteNombre, mensajeId, conversacionId, contenido);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        const notificacion = {
          usuario: destinatarioId,
          tipo: 'mensaje',
          titulo: `Nuevo mensaje de ${remitenteNombre}`,
          contenido: contenido.length > 100 ? `${contenido.substring(0, 100)}...` : contenido,
          prioridad: 'normal',
          accion: {
            tipo: 'abrir_conversacion',
            metadata: { conversacionId, mensajeId }
          },
          metadata: {
            mensaje: mensajeId,
            conversacion: conversacionId,
            remitente: remitenteId
          }
        };
        
        console.log('DEBUG: Enviando notificación de mensaje:', {
          destinatarioId,
          remitenteId,
          mensajeId,
          conversacionId,
          notificacion
        });
        
        await socketServer.sendNotificationToUser(destinatarioId, notificacion);
        logger.info(`Notificación de mensaje enviada en tiempo real a ${destinatarioId}`);
      } else {
        console.log('DEBUG: socketServer no está disponible para mensaje');
      }
    } catch (error) {
      logger.error('Error al notificar mensaje:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio de sesión de entrenamiento
   */
  public async crearRecordatorioSesion(
    clienteId: string,
    entrenadorId: string,
    sesionId: string,
    nombreSesion: string,
    fechaHora: Date,
    planId?: string
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'recordatorio' as const,
        titulo: 'Recordatorio de sesión de entrenamiento',
        contenido: `Tu sesión "${nombreSesion}" está programada para ${fechaHora.toLocaleString('es-ES')}. ¡Prepárate!`,
        prioridad: 'alta' as const,
        programadaPara: new Date(fechaHora.getTime() - 60 * 60 * 1000), // 1 hora antes
        accion: {
          tipo: 'abrir_plan' as const,
          metadata: {
            sesionId,
            ...(planId && { planId })
          }
        },
        metadata: {
          sesion: sesionId,
          planEntrenamiento: planId,
          remitente: entrenadorId
        }
      };

      // Crear notificación en la base de datos
      await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Recordatorio de sesión enviado en tiempo real a ${clienteId}: ${nombreSesion}`);
      }
    } catch (error) {
      logger.error('Error al crear recordatorio de sesión:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio de comida
   */
  public async crearRecordatorioComida(
    clienteId: string,
    nutricionistaId: string,
    dietaId: string,
    nombreComida: string,
    fechaHora: Date,
    diaIndex?: number
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'recordatorio' as const,
        titulo: 'Recordatorio de comida',
        contenido: `Es hora de tu ${nombreComida} del día ${(diaIndex || 0) + 1}. ¡Mantén tu rutina!`,
        prioridad: 'normal' as const,
        programadaPara: new Date(fechaHora.getTime() - 30 * 60 * 1000), // 30 minutos antes
        accion: {
          tipo: 'abrir_dieta' as const,
          metadata: {
            dietaId,
            ...(diaIndex !== undefined && { dia: diaIndex.toString() })
          }
        },
        metadata: {
          dieta: dietaId,
          remitente: nutricionistaId
        }
      };

      // Crear notificación en la base de datos
      await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionData as unknown as Record<string, unknown>);
        logger.info(`Recordatorio de comida enviado en tiempo real a ${clienteId}: ${nombreComida}`);
      }
    } catch (error) {
      logger.error('Error al crear recordatorio de comida:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const notificacionIntegracionService = NotificacionIntegracionService.getInstance();
