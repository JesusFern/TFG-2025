import { notificacionIntegracionService } from './notificacionIntegracionService';
import { crearNotificacionService } from '../chats/notificacionService';
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
      // Usar el servicio de integración que maneja tanto BD como WebSocket
      await notificacionIntegracionService.crearRecordatorioSesion(
        clienteId,
        entrenadorId,
        sesionId,
        nombreSesion,
        fechaHora,
        planId
      );

      logger.info('Recordatorio de sesión programado', {
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
      // Usar el servicio de integración que maneja tanto BD como WebSocket
      await notificacionIntegracionService.crearRecordatorioComida(
        clienteId,
        nutricionistaId,
        dietaId,
        nombreComida,
        fechaHora,
        diaIndex
      );

      logger.info('Recordatorio de comida programado', {
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
      const notificacionData = {
        usuario: clienteId,
        tipo: 'recordatorio' as const,
        titulo: 'Recordatorio de cita',
        contenido: `Tienes una cita de ${tipoCita} programada para ${fechaHora.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}. ¡No la olvides!`,
        prioridad: 'alta' as const,
        programadaPara: new Date(fechaHora.getTime() - 60 * 60 * 1000), // 1 hora antes
        expiraEn: new Date(fechaHora.getTime() + 2 * 60 * 60 * 1000), // Expira 2 horas después de la cita
        accion: {
          tipo: 'navegar' as const,
          url: `/citas/${citaId}`
        },
        metadata: {
          remitente: profesionalId
        }
      };

      await crearNotificacionService(notificacionData);

      logger.info('Recordatorio de cita programado', {
        clienteId,
        citaId,
        fechaHora,
        programadaPara: notificacionData.programadaPara.toLocaleString('es-ES')
      });
    } catch (error) {
      logger.error('Error al crear recordatorio de cita:', error);
      throw error;
    }
  }
}

export const recordatorioService = RecordatorioService.getInstance();
