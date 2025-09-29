import { notificacionIntegracionService } from './notificacionIntegracionService';
import { crearNotificacionService } from '../chats/notificacionService';
import { socketServer } from '../../server';
import logger from '../../utils/logger';

/**
 * Servicio para manejar recordatorios automáticos
 */
export class RecordatorioService {
  private static instance: RecordatorioService;

  private constructor() {}

  public static getInstance(): RecordatorioService {
    if (!RecordatorioService.instance) {
      RecordatorioService.instance = new RecordatorioService();
    }
    return RecordatorioService.instance;
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
    planId: string
  ): Promise<void> {
    try {
      // Crear notificación en la base de datos
      await crearNotificacionService({
        usuario: clienteId,
        tipo: 'recordatorio',
        titulo: 'Recordatorio de sesión de entrenamiento',
        contenido: `Tu sesión "${nombreSesion}" está programada para ${fechaHora.toLocaleString('es-ES')}. ¡Prepárate!`,
        prioridad: 'alta',
        programadaPara: new Date(fechaHora.getTime() - 60 * 60 * 1000), // 1 hora antes
        accion: {
          tipo: 'abrir_plan',
          metadata: {
            sesionId,
            planId
          }
        },
        metadata: {
          sesion: sesionId,
          planEntrenamiento: planId,
          remitente: entrenadorId
        }
      });

      // Enviar notificación en tiempo real
      await notificacionIntegracionService.crearRecordatorioSesion(
        clienteId,
        entrenadorId,
        sesionId,
        nombreSesion,
        fechaHora,
        planId
      );

      logger.info('Recordatorio de sesión creado y enviado', {
        clienteId,
        sesionId,
        fechaHora
      });
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
    diaIndex: number
  ): Promise<void> {
    try {
      // Crear notificación en la base de datos
      await crearNotificacionService({
        usuario: clienteId,
        tipo: 'recordatorio',
        titulo: 'Recordatorio de comida',
        contenido: `Es hora de tu ${nombreComida} del día ${diaIndex + 1}. ¡Mantén tu rutina!`,
        prioridad: 'normal',
        programadaPara: new Date(fechaHora.getTime() - 30 * 60 * 1000), // 30 minutos antes
        accion: {
          tipo: 'abrir_dieta',
          metadata: {
            dietaId,
            dia: diaIndex.toString()
          }
        },
        metadata: {
          dieta: dietaId,
          remitente: nutricionistaId
        }
      });

      // Enviar notificación en tiempo real
      await notificacionIntegracionService.crearRecordatorioComida(
        clienteId,
        nutricionistaId,
        dietaId,
        nombreComida,
        fechaHora,
        diaIndex
      );

      logger.info('Recordatorio de comida creado y enviado', {
        clienteId,
        dietaId,
        diaIndex,
        fechaHora
      });
    } catch (error) {
      logger.error('Error al crear recordatorio de comida:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio de cita
   */
  public async crearRecordatorioCita(
    clienteId: string,
    profesionalId: string,
    citaId: string,
    tipoCita: string,
    fechaHora: Date
  ): Promise<void> {
    try {
      // Crear notificación en la base de datos
      await crearNotificacionService({
        usuario: clienteId,
        tipo: 'recordatorio',
        titulo: 'Recordatorio de cita',
        contenido: `Tienes una cita de ${tipoCita} programada para ${fechaHora.toLocaleString('es-ES')}. ¡No la olvides!`,
        prioridad: 'alta',
        programadaPara: new Date(fechaHora.getTime() - 60 * 60 * 1000), // 1 hora antes
        accion: {
          tipo: 'navegar',
          url: `/citas/${citaId}`
        },
        metadata: {
          remitente: profesionalId
        }
      });

      // Enviar notificación en tiempo real
      if (socketServer) {
        const notificacion = {
          usuario: clienteId,
          tipo: 'recordatorio',
          titulo: 'Recordatorio de cita',
          contenido: `Tienes una cita de ${tipoCita} programada para ${fechaHora.toLocaleString('es-ES')}. ¡No la olvides!`,
          prioridad: 'alta',
          programadaPara: fechaHora,
          accion: {
            tipo: 'navegar',
            url: `/citas/${citaId}`
          },
          metadata: {
            remitente: profesionalId
          }
        };

        await socketServer.sendNotificationToUser(clienteId, notificacion as unknown as Record<string, unknown>);
        logger.info(`Recordatorio de cita enviado en tiempo real a ${clienteId}`);
      }

      logger.info('Recordatorio de cita creado y enviado', {
        clienteId,
        citaId,
        fechaHora
      });
    } catch (error) {
      logger.error('Error al crear recordatorio de cita:', error);
      throw error;
    }
  }
}

export const recordatorioService = RecordatorioService.getInstance();
