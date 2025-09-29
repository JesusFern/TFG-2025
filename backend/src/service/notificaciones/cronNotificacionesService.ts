import * as cron from 'node-cron';
import { 
  obtenerNotificacionesProgramadasService,
  marcarNotificacionComoEnviadaService
} from '../chats/notificacionService';
import { seguimientoInactivoService } from './seguimientoInactivoService';
import { recordatorioService } from './recordatorioService';
import { socketServer } from '../../server';
import logger from '../../utils/logger';

/**
 * Servicio para manejar notificaciones programadas con cron jobs
 */
export class CronNotificacionesService {
  private static instance: CronNotificacionesService;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): CronNotificacionesService {
    if (!CronNotificacionesService.instance) {
      CronNotificacionesService.instance = new CronNotificacionesService();
    }
    return CronNotificacionesService.instance;
  }

  /**
   * Iniciar el servicio de cron jobs
   */
  public iniciar(): void {
    if (this.isRunning) {
      logger.warn('El servicio de cron jobs ya está ejecutándose');
      return;
    }

    // Ejecutar cada minuto para verificar notificaciones programadas
    cron.schedule('* * * * *', async () => {
      await this.procesarNotificacionesProgramadas();
    });

    // Ejecutar cada día a las 9:00 AM para verificar seguimiento inactivo
    cron.schedule('0 9 * * *', async () => {
      await this.verificarSeguimientoInactivo();
    });

    this.isRunning = true;
    logger.info('Servicio de cron jobs de notificaciones iniciado');
  }

  /**
   * Detener el servicio de cron jobs
   */
  public detener(): void {
    if (!this.isRunning) {
      logger.warn('El servicio de cron jobs no está ejecutándose');
      return;
    }

    cron.getTasks().forEach(task => {
      task.destroy();
    });

    this.isRunning = false;
    logger.info('Servicio de cron jobs de notificaciones detenido');
  }

  /**
   * Procesar notificaciones programadas que deben enviarse
   */
  private async procesarNotificacionesProgramadas(): Promise<void> {
    try {
      const notificaciones = await obtenerNotificacionesProgramadasService();
      
      if (notificaciones.length === 0) {
        return;
      }

      logger.info(`Procesando ${notificaciones.length} notificaciones programadas`);

      for (const notificacion of notificaciones) {
        try {
          // Aquí se podría integrar con servicios de notificación externos
          // como email, push notifications, SMS, etc.
          await this.enviarNotificacion(notificacion);
          
          // Marcar como enviada
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await marcarNotificacionComoEnviadaService((notificacion as any)._id.toString());
          
          logger.info(`Notificación enviada: ${notificacion.titulo}`, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            notificacionId: (notificacion as any)._id,
            usuario: notificacion.usuario
          });
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger.error(`Error al enviar notificación ${(notificacion as any)._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error al procesar notificaciones programadas:', error);
    }
  }

  /**
   * Verificar usuarios con seguimiento inactivo (3+ días sin registros)
   */
  private async verificarSeguimientoInactivo(): Promise<void> {
    try {
      logger.info('Verificando seguimiento inactivo de usuarios');
      await seguimientoInactivoService.verificarSeguimientoInactivo();
      logger.info('Verificación de seguimiento inactivo completada');
    } catch (error) {
      logger.error('Error al verificar seguimiento inactivo:', error);
    }
  }

  /**
   * Enviar notificación (integración con WebSocket y servicios externos)
   */
  private async enviarNotificacion(notificacion: Record<string, unknown>): Promise<void> {
    try {
      // Enviar notificación en tiempo real a través de WebSocket
      if (socketServer) {
        await socketServer.sendScheduledNotification(notificacion);
        logger.info(`Notificación enviada en tiempo real: ${notificacion.titulo}`, {
          tipo: notificacion.tipo,
          prioridad: notificacion.prioridad,
          usuario: notificacion.usuario
        });
      } else {
        logger.warn('SocketServer no disponible para enviar notificación en tiempo real');
      }
      
    } catch (error) {
      logger.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio automático de sesión de entrenamiento
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
      await recordatorioService.crearRecordatorioSesion(
        clienteId,
        entrenadorId,
        sesionId,
        nombreSesion,
        fechaHora,
        planId
      );
    } catch (error) {
      logger.error('Error al crear recordatorio de sesión:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio automático de comida
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
      await recordatorioService.crearRecordatorioComida(
        clienteId,
        nutricionistaId,
        dietaId,
        nombreComida,
        fechaHora,
        diaIndex
      );
    } catch (error) {
      logger.error('Error al crear recordatorio de comida:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio automático de cita
   */
  public async crearRecordatorioCita(
    clienteId: string,
    profesionalId: string,
    citaId: string,
    tipoCita: string,
    fechaHora: Date
  ): Promise<void> {
    try {
      await recordatorioService.crearRecordatorioCita(
        clienteId,
        profesionalId,
        citaId,
        tipoCita,
        fechaHora
      );
    } catch (error) {
      logger.error('Error al crear recordatorio de cita:', error);
      throw error;
    }
  }

  /**
   * Verificar si el servicio está ejecutándose
   */
  public getEstado(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}

// Exportar instancia singleton
export const cronNotificacionesService = CronNotificacionesService.getInstance();
