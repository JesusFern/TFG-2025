import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { verificarAutenticacion } from '../../validators/commonValidators';
import User from '../../models/users/user';
import logger from '../../utils/logger';

export class WorkerController {

  static async getEstadisticasNutricionalesCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'obtener estadísticas nutricionales del cliente');
      if (!userId) return;

      const { clienteId } = req.params;
      const { semana, año } = req.query;

      // Verificar que el trabajador tiene acceso a este cliente
      const worker = await User.findById(userId);
      if (!worker || worker.role !== 'worker') {
        res.status(403).json({
          success: false,
          message: 'Solo los trabajadores pueden acceder a esta información'
        });
        return;
      }

      // Verificar que el cliente está asignado al trabajador como nutricionista
      const clienteAsignado = worker.clientesAsignados?.find(
        asignacion => asignacion.clienteId.toString() === clienteId && 
        asignacion.tipoAsignacion === 'Nutricionista'
      );

      if (!clienteAsignado) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a las estadísticas nutricionales de este cliente'
        });
        return;
      }

      // Obtener estadísticas reales del cliente usando el servicio existente
      const { obtenerEstadisticasGeneralesService, obtenerEstadisticasSemanalService, obtenerProgresoComidasService } = await import('../../service/diets/seguimientoComidaService');
      
      // Obtener estadísticas generales
      const estadisticasGenerales = await obtenerEstadisticasGeneralesService({
        userId: clienteId
      });
      
      // Obtener estadísticas semanales
      const semanaNum = semana ? parseInt(semana as string) : 1;
      const añoNum = año ? parseInt(año as string) : new Date().getFullYear();
      const estadisticasSemanal = await obtenerEstadisticasSemanalService({
        userId: clienteId,
        numeroSemana: semanaNum,
        año: añoNum
      });
      
      // Obtener progreso de comidas
      const progresoComidas = await obtenerProgresoComidasService({
        userId: clienteId,
        limite: 10,
        offset: 0,
        ordenarPor: 'satisfaccionPromedio',
        orden: 'desc'
      });

      logger.info('Estadísticas nutricionales del cliente obtenidas', {
        workerId: userId,
        clienteId,
        semana,
        año
      });

      res.status(200).json({
        success: true,
        estadisticas: estadisticasGenerales,
        estadisticasSemanal: estadisticasSemanal,
        progresoComidas: progresoComidas
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas nutricionales del cliente', {
        error: error instanceof Error ? error.message : String(error),
        userId: req.user?.id,
        clienteId: req.params.clienteId
      });

      res.status(500).json({ 
        message: 'Error interno del servidor al obtener estadísticas nutricionales del cliente' 
      });
    }
  }

  static async getEstadisticasEntrenamientoCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'obtener estadísticas de entrenamiento del cliente');
      if (!userId) return;

      const { clienteId } = req.params;
      const { semana, año } = req.query;

      // Verificar que el trabajador tiene acceso a este cliente
      const worker = await User.findById(userId);
      if (!worker || worker.role !== 'worker') {
        res.status(403).json({
          success: false,
          message: 'Solo los trabajadores pueden acceder a esta información'
        });
        return;
      }

      // Verificar que el cliente está asignado al trabajador como entrenador personal
      const clienteAsignado = worker.clientesAsignados?.find(
        asignacion => asignacion.clienteId.toString() === clienteId && 
        asignacion.tipoAsignacion === 'Entrenador personal'
      );

      if (!clienteAsignado) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a las estadísticas de entrenamiento de este cliente'
        });
        return;
      }

      // Aquí deberías implementar la lógica para obtener las estadísticas de entrenamiento
      // Por ahora, devolveremos datos simulados
      const estadisticas = {
        porcentajeCompletitudGeneral: 80,
        totalSesionesRegistradas: 12,
        totalSesionesPlanificadas: 15,
        promedioIntensidad: 4.2,
        promedioSatisfaccion: 4.5,
        rutinasActivas: 1,
        totalRutinas: 1
      };

      const estadisticasSemanal = {
        semana: {
          numero: semana ? parseInt(semana as string) : 1,
          año: año ? parseInt(año as string) : new Date().getFullYear(),
          fechaInicio: new Date().toISOString(),
          fechaFin: new Date().toISOString()
        },
        progreso: {
          sesionesRegistradas: 3,
          sesionesPlanificadas: 4,
          porcentajeCompletitud: 75,
          promedioIntensidad: 4.0,
          promedioSatisfaccion: 4.3
        },
        asistencia: {
          sesionesAsistidas: 3,
          sesionesProgramadas: 4,
          porcentajeAsistencia: 75
        },
        tendencias: {
          intensidad: 'mejorando',
          asistencia: 'estable'
        }
      };

      logger.info('Estadísticas de entrenamiento del cliente obtenidas', {
        workerId: userId,
        clienteId,
        semana,
        año
      });

      res.status(200).json({
        success: true,
        estadisticas,
        estadisticasSemanal
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de entrenamiento del cliente', {
        error: error instanceof Error ? error.message : String(error),
        userId: req.user?.id,
        clienteId: req.params.clienteId
      });

      res.status(500).json({ 
        message: 'Error interno del servidor al obtener estadísticas de entrenamiento del cliente' 
      });
    }
  }
}
