import RegistroEjercicio from '../../models/training/registroEjercicio';
import Dieta from '../../models/diets/dieta';
import User from '../../models/users/user';
import { crearNotificacionSeguimientoInactivoService } from '../chats/notificacionService';
import { socketServer } from '../../server';
import logger from '../../utils/logger';
import mongoose from 'mongoose';

/**
 * Servicio para verificar y notificar sobre seguimiento inactivo de usuarios
 */
export class SeguimientoInactivoService {
  private static instance: SeguimientoInactivoService;

  private constructor() {}

  public static getInstance(): SeguimientoInactivoService {
    if (!SeguimientoInactivoService.instance) {
      SeguimientoInactivoService.instance = new SeguimientoInactivoService();
    }
    return SeguimientoInactivoService.instance;
  }

  /**
   * Verificar todos los usuarios con seguimiento inactivo
   */
  public async verificarSeguimientoInactivo(): Promise<void> {
    try {
      logger.info('Iniciando verificación de seguimiento inactivo');

      // Verificar seguimiento de entrenamientos
      await this.verificarSeguimientoEntrenamientos();

      // Verificar seguimiento de dietas
      await this.verificarSeguimientoDietas();

      logger.info('Verificación de seguimiento inactivo completada');
    } catch (error) {
      logger.error('Error al verificar seguimiento inactivo:', error);
    }
  }

  /**
   * Verificar seguimiento inactivo de entrenamientos
   */
  private async verificarSeguimientoEntrenamientos(): Promise<void> {
    try {
      const tresDiasAtras = new Date();
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

      // Obtener todos los clientes con entrenadores asignados
      const clientesConEntrenadores = await User.find({
        role: 'user',
        entrenadorAsignado: { $exists: true, $ne: null }
      }).select('_id entrenadorAsignado') as Array<{
        _id: mongoose.Types.ObjectId;
        entrenadorAsignado: mongoose.Types.ObjectId;
      }>;

      for (const cliente of clientesConEntrenadores) {
        try {
          // Buscar el último registro de ejercicio completado
          const ultimoRegistro = await RegistroEjercicio.findOne({
            cliente: cliente._id as mongoose.Types.ObjectId,
            completado: true
          }).sort({ fecha: -1 });

          if (!ultimoRegistro) {
            // Si no tiene registros, verificar si tiene un plan asignado
            const tienePlan = await this.clienteTienePlanEntrenamiento(cliente._id as mongoose.Types.ObjectId);
            if (tienePlan) {
              await this.crearNotificacionInactivo(
                (cliente._id as mongoose.Types.ObjectId).toString(),
                (cliente.entrenadorAsignado as mongoose.Types.ObjectId).toString(),
                'entrenamiento',
                3 // Asumimos 3+ días si no tiene registros
              );
            }
            continue;
          }

          // Calcular días de inactividad
          const diasInactivo = Math.floor(
            (Date.now() - ultimoRegistro.fecha.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diasInactivo >= 3) {
            await this.crearNotificacionInactivo(
              (cliente._id as mongoose.Types.ObjectId).toString(),
              (cliente.entrenadorAsignado as mongoose.Types.ObjectId).toString(),
              'entrenamiento',
              diasInactivo
            );
          }
        } catch (error) {
          logger.error(`Error al verificar seguimiento de entrenamiento para cliente ${cliente._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error al verificar seguimiento de entrenamientos:', error);
    }
  }

  /**
   * Verificar seguimiento inactivo de dietas
   */
  private async verificarSeguimientoDietas(): Promise<void> {
    try {
      const tresDiasAtras = new Date();
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

      // Obtener todas las dietas activas (no en draft mode)
      const dietasActivas = await Dieta.find({
        draftMode: false,
        asignadaA: { $exists: true, $ne: [] }
      }).populate('asignadaA', '_id').populate('creador', '_id');

      for (const dieta of dietasActivas) {
        if (!dieta.creador || !dieta.asignadaA || dieta.asignadaA.length === 0) {
          continue;
        }

        for (const clienteId of dieta.asignadaA) {
          try {
            // Buscar el último día con cumplimiento registrado
            const ultimoDiaConCumplimiento = await this.obtenerUltimoDiaConCumplimiento(dieta, clienteId);

            if (!ultimoDiaConCumplimiento) {
              // Si no tiene registros de cumplimiento, verificar si la dieta ya comenzó
              const diasDesdeInicio = Math.floor(
                (Date.now() - dieta.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
              );
              
              if (diasDesdeInicio >= 3) {
                await this.crearNotificacionInactivo(
                  clienteId.toString(),
                  dieta.creador.toString(),
                  'nutricion',
                  diasDesdeInicio
                );
              }
              continue;
            }

            // Calcular días de inactividad
            const diasInactivo = Math.floor(
              (Date.now() - ultimoDiaConCumplimiento.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diasInactivo >= 3) {
              await this.crearNotificacionInactivo(
                clienteId.toString(),
                dieta.creador.toString(),
                'nutricion',
                diasInactivo
              );
            }
          } catch (error) {
            logger.error(`Error al verificar seguimiento de dieta para cliente ${clienteId}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error('Error al verificar seguimiento de dietas:', error);
    }
  }

  /**
   * Verificar si un cliente tiene un plan de entrenamiento asignado
   */
  private async clienteTienePlanEntrenamiento(clienteId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const PlanEntrenamiento = (await import('../../models/training/planEntrenamiento')).default;
      const plan = await PlanEntrenamiento.findOne({
        clientes: clienteId,
        draftMode: false
      });
      return !!plan;
    } catch (error) {
      logger.error('Error al verificar plan de entrenamiento:', error);
      return false;
    }
  }

  /**
   * Obtener el último día con cumplimiento registrado en una dieta
   */
  private async obtenerUltimoDiaConCumplimiento(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dieta: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clienteId: mongoose.Types.ObjectId
  ): Promise<Date | null> {
    try {
      // Buscar el último día que tiene cumplimiento registrado (true o false)
      for (let i = dieta.dias.length - 1; i >= 0; i--) {
        const dia = dieta.dias[i];
        if (dia.cumplimiento !== undefined && dia.cumplimiento !== null) {
          // Calcular la fecha del día basándose en la fecha de inicio
          const fechaDia = new Date(dieta.fechaInicio);
          fechaDia.setDate(fechaDia.getDate() + i);
          return fechaDia;
        }
      }
      return null;
    } catch (error) {
      logger.error('Error al obtener último día con cumplimiento:', error);
      return null;
    }
  }

  /**
   * Crear notificación de seguimiento inactivo
   */
  private async crearNotificacionInactivo(
    clienteId: string,
    profesionalId: string,
    tipo: 'entrenamiento' | 'nutricion',
    diasInactivo: number
  ): Promise<void> {
    try {
      // Verificar si ya se envió una notificación reciente (últimas 24 horas)
      const hace24Horas = new Date();
      hace24Horas.setHours(hace24Horas.getHours() - 24);

      const notificacionReciente = await this.verificarNotificacionReciente(
        clienteId,
        profesionalId,
        tipo,
        hace24Horas
      );

      if (notificacionReciente) {
        logger.info(`Ya se envió notificación de seguimiento inactivo recientemente para ${clienteId}`);
        return;
      }

      const notificaciones = await crearNotificacionSeguimientoInactivoService(
        clienteId,
        profesionalId,
        tipo,
        diasInactivo
      );

      // Enviar notificaciones en tiempo real a través de WebSocket
      if (socketServer && notificaciones) {
        for (const notificacion of notificaciones) {
          try {
            await socketServer.sendInactiveTrackingNotification(notificacion as unknown as Record<string, unknown>);
            logger.info(`Notificación de seguimiento inactivo enviada en tiempo real: ${notificacion.titulo}`);
          } catch (error) {
            logger.error('Error al enviar notificación en tiempo real:', error);
          }
        }
      }

      logger.info(`Notificación de seguimiento inactivo creada para ${clienteId} (${tipo}, ${diasInactivo} días)`);
    } catch (error) {
      logger.error(`Error al crear notificación de seguimiento inactivo:`, error);
    }
  }

  /**
   * Verificar si ya se envió una notificación reciente del mismo tipo
   */
  private async verificarNotificacionReciente(
    clienteId: string,
    profesionalId: string,
    tipo: 'entrenamiento' | 'nutricion',
    desdeFecha: Date
  ): Promise<boolean> {
    try {
      const Notificacion = (await import('../../models/chats/notificacion')).default;
      
      const notificacion = await Notificacion.findOne({
        $and: [
          {
            $or: [
              { usuario: clienteId },
              { usuario: profesionalId }
            ]
          },
          {
            $or: [
              { 'metadata.remitente': clienteId },
              { 'metadata.remitente': profesionalId }
            ]
          }
        ],
        tipo: tipo,
        createdAt: { $gte: desdeFecha }
      });

      return !!notificacion;
    } catch (error) {
      logger.error('Error al verificar notificación reciente:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const seguimientoInactivoService = SeguimientoInactivoService.getInstance();
