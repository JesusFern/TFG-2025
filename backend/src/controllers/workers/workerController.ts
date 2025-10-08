import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';
import { verificarAccesoTrabajadorCliente } from '../../helpers/workerHelpers';
import { 
  obtenerEstadisticasClienteService, 
  obtenerEstadisticasSemanalService,
  getCurrentWeekNumber 
} from '../../service/training/estadisticasService';

export class WorkerController {

  static async getClientesInactivos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar que el usuario es un trabajador
      const User = (await import('../../models/users/user')).default;
      const trabajador = await User.findById(userId);
      
      if (!trabajador || trabajador.role !== 'worker') {
        res.status(403).json({ message: 'Solo los trabajadores pueden acceder a esta información' });
        return;
      }

      // Obtener clientes inactivos
      const { obtenerClientesInactivosService } = await import('../../service/diets/seguimientoComidaService');
      const clientesInactivos = await obtenerClientesInactivosService(userId);

      logger.info('Clientes inactivos obtenidos', {
        workerId: userId,
        totalInactivos: clientesInactivos.length
      });

      res.status(200).json({
        success: true,
        clientesInactivos
      });
    } catch (error) {
      logger.error('Error al obtener clientes inactivos', {
        error: error instanceof Error ? error.message : String(error),
        userId: req.user?.id
      });

      res.status(500).json({ 
        message: 'Error interno del servidor al obtener clientes inactivos' 
      });
    }
  }

  static async getEstadisticasNutricionalesCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const acceso = await verificarAccesoTrabajadorCliente(req, res, 'Nutricionista');
      if (!acceso) return;

      const { userId, clienteId } = acceso;
      const { semana, año } = req.query;

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

      // Transformar los datos de progreso de comidas al formato esperado por el frontend
      const progresoComidasTransformado = progresoComidas.comidas.map((comida: { nombre: string; satisfaccionPromedio: number; cumplimientoPromedio: number; vecesConsumida: number; ultimaConsumida: string | null }) => ({
        comidaId: comida.nombre, // Usar el nombre como ID temporal
        nombreComida: comida.nombre,
        nombreDieta: 'Dieta General', // Valor por defecto
        estadisticas: {
          totalRegistros: comida.vecesConsumida,
          satisfaccionPromedio: comida.satisfaccionPromedio,
          cumplimientoPromedio: comida.cumplimientoPromedio,
          tendenciaSatisfaccion: 'estable' // Valor por defecto
        }
      }));

      res.status(200).json({
        success: true,
        estadisticas: estadisticasGenerales,
        estadisticasSemanal: estadisticasSemanal,
        progresoComidas: progresoComidasTransformado
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
      const acceso = await verificarAccesoTrabajadorCliente(req, res, 'Entrenador personal');
      if (!acceso) return;

      const { userId, clienteId } = acceso;
      const { semana, año } = req.query;

      // Obtener estadísticas reales usando el servicio
      const estadisticasGenerales = await obtenerEstadisticasClienteService(clienteId);
      
      const semanaNum = semana ? parseInt(semana as string) : undefined;
      const añoNum = año ? parseInt(año as string) : undefined;
      const estadisticasSemanal = await obtenerEstadisticasSemanalService(
        clienteId, 
        semanaNum || getCurrentWeekNumber(), 
        añoNum || new Date().getFullYear()
      );

      logger.info('Estadísticas de entrenamiento del cliente obtenidas', {
        workerId: userId,
        clienteId,
        semana: semanaNum,
        año: añoNum
      });

      res.status(200).json({
        success: true,
        estadisticas: estadisticasGenerales,
        estadisticasSemanal: estadisticasSemanal
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
