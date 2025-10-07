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
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionGuardada as unknown as Record<string, unknown>);
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
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionGuardada as unknown as Record<string, unknown>);
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
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionGuardada as unknown as Record<string, unknown>);
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
      // Crear notificación en la base de datos (retorna la notificación guardada con _id)
      const notificacionGuardada = await notificarMensajeChatService(destinatarioId, remitenteId, remitenteNombre, mensajeId, conversacionId, contenido);
      
      // Enviar notificación en tiempo real usando la notificación guardada (que tiene _id)
      if (socketServer) {
        await socketServer.sendNotificationToUser(destinatarioId, notificacionGuardada as unknown as Record<string, unknown>);
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
      const programadaPara = new Date(fechaHora.getTime() - 60 * 60 * 1000); // 1 hora antes

      const notificacionData = {
        usuario: clienteId,
        tipo: 'recordatorio' as const,
        titulo: 'Recordatorio de sesión de entrenamiento',
        contenido: `Tu sesión "${nombreSesion}" está programada para ${fechaHora.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}. ¡Prepárate!`,
        prioridad: 'alta' as const,
        programadaPara: programadaPara,
        expiraEn: new Date(fechaHora.getTime() + 2 * 60 * 60 * 1000), // Expira 2 horas después de la sesión
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

      // Crear notificación en la base de datos (programada para 1 hora antes)
      await crearNotificacionService(notificacionData);
      
      logger.info(`Recordatorio de sesión programado para ${clienteId}: ${nombreSesion} (${notificacionData.programadaPara.toLocaleString('es-ES')})`);
    } catch (error) {
      logger.error('Error al crear recordatorio de sesión:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando un cliente solicita asignación a un trabajador
   */
  public async notificarSolicitudAsignacion(
    trabajadorId: string,
    clienteId: string,
    clienteNombre: string,
    solicitudId: string,
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal'
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: trabajadorId,
        tipo: 'sistema' as const,
        titulo: 'Nueva solicitud de asignación',
        contenido: `${clienteNombre} te ha solicitado como ${tipoAsignacion}. Revisa la solicitud y decide si aceptarla o rechazarla.`,
        prioridad: 'alta' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/solicitudes',
          metadata: { solicitudId }
        },
        metadata: {
          remitente: clienteId
        }
      };

      // Crear notificación en la base de datos
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(trabajadorId, notificacionGuardada as unknown as Record<string, unknown>);
      }

      logger.info(`Notificación de solicitud de asignación enviada a trabajador ${trabajadorId}`);
    } catch (error) {
      logger.error('Error al notificar solicitud de asignación:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando un trabajador acepta la solicitud de asignación
   */
  public async notificarAsignacionAceptada(
    clienteId: string,
    trabajadorId: string,
    trabajadorNombre: string,
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal'
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'sistema' as const,
        titulo: '¡Solicitud aceptada!',
        contenido: `${trabajadorNombre} ha aceptado tu solicitud. Ya tienes un ${tipoAsignacion} asignado. ¡Comienza tu camino hacia tus objetivos!`,
        prioridad: 'alta' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/dashboard'
        },
        metadata: {
          remitente: trabajadorId
        }
      };

      // Crear notificación en la base de datos
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionGuardada as unknown as Record<string, unknown>);
      }

      logger.info(`Notificación de asignación aceptada enviada a cliente ${clienteId}`);
    } catch (error) {
      logger.error('Error al notificar asignación aceptada:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando un trabajador rechaza la solicitud de asignación
   */
  public async notificarAsignacionRechazada(
    clienteId: string,
    trabajadorId: string,
    trabajadorNombre: string,
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal'
  ): Promise<void> {
    try {
      const notificacionData = {
        usuario: clienteId,
        tipo: 'sistema' as const,
        titulo: 'Solicitud rechazada',
        contenido: `${trabajadorNombre} no ha podido aceptar tu solicitud de ${tipoAsignacion} en este momento. Puedes intentar con otro profesional.`,
        prioridad: 'normal' as const,
        accion: {
          tipo: 'navegar' as const,
          url: '/profesionales'
        },
        metadata: {
          remitente: trabajadorId
        }
      };

      // Crear notificación en la base de datos
      const notificacionGuardada = await crearNotificacionService(notificacionData);
      
      // Enviar notificación en tiempo real
      if (socketServer) {
        await socketServer.sendNotificationToUser(clienteId, notificacionGuardada as unknown as Record<string, unknown>);
      }

      logger.info(`Notificación de asignación rechazada enviada a cliente ${clienteId}`);
    } catch (error) {
      logger.error('Error al notificar asignación rechazada:', error);
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
        expiraEn: new Date(fechaHora.getTime() + 2 * 60 * 60 * 1000), // Expira 2 horas después de la comida
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

      // Crear notificación en la base de datos (programada para 30 minutos antes)
      await crearNotificacionService(notificacionData);
      
      logger.info(`Recordatorio de comida programado para ${clienteId}: ${nombreComida} (${notificacionData.programadaPara.toLocaleString('es-ES')})`);
    } catch (error) {
      logger.error('Error al crear recordatorio de comida:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const notificacionIntegracionService = NotificacionIntegracionService.getInstance();
