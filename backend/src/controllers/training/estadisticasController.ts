import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  obtenerEstadisticasClienteService,
  obtenerEstadisticasSemanalService,
  obtenerProgresoEjerciciosService,
  obtenerRachasEntrenamientoService,
  obtenerClientesTrabajadorService,
  obtenerDetallesClienteService
} from '../../service/training/estadisticasService';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';
export const obtenerEstadisticasCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clienteId } = matchedData(req, { locations: ['params'] }) as { clienteId: string };
    const { fechaInicio, fechaFin } = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      fechaInicio?: string;
      fechaFin?: string;
    };

    // Verificar que el usuario autenticado es un entrenador
    if (req.user?.role !== 'worker') {
      res.status(403).json({ message: 'Solo los entrenadores pueden acceder a las estadísticas de clientes' });
      return;
    }

    // Convertir fechas si se proporcionan
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

    logger.debug('Obteniendo estadísticas del cliente', {
      clienteId,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate
    });

    const estadisticas = await obtenerEstadisticasClienteService(
      clienteId,
      fechaInicioDate,
      fechaFinDate
    );

    logger.info('Estadísticas del cliente obtenidas correctamente', { clienteId });
    res.status(200).json({ 
      success: true,
      message: 'Estadísticas obtenidas correctamente', 
      estadisticas 
    });

  } catch (error) {
    logger.error('Error al obtener estadísticas del cliente', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.params.clienteId
    });
    res.status(400).json({ 
      message: 'Error al obtener estadísticas del cliente', 
      error: (error as Error).message 
    });
  }
};

export const obtenerEstadisticasSemanal = async (req: AuthenticatedRequest, res: Response) => {
  console.log('obtenerEstadisticasSemanal called with:', req.params);
  try {
    const { clienteId, numeroSemana, anio } = matchedData(req, { locations: ['params'] }) as {
      clienteId: string;
      numeroSemana: string;
      anio: string;
    };

    // Verificar que el usuario autenticado es un entrenador
    if (req.user?.role !== 'worker') {
      res.status(403).json({ message: 'Solo los entrenadores pueden acceder a las estadísticas de clientes' });
      return;
    }

    const numeroSemanaNum = parseInt(numeroSemana);
    const anioNum = parseInt(anio);

    logger.debug('Obteniendo estadísticas semanales', {
      clienteId,
      numeroSemana: numeroSemanaNum,
      año: anioNum
    });

    const estadisticas = await obtenerEstadisticasSemanalService(
      clienteId,
      numeroSemanaNum,
      anioNum
    );

    logger.info('Estadísticas semanales obtenidas correctamente', { 
      clienteId, 
      numeroSemana: numeroSemanaNum 
    });
    res.status(200).json({ 
      success: true,
      message: 'Estadísticas semanales obtenidas correctamente', 
      estadisticas 
    });

  } catch (error) {
    logger.error('Error al obtener estadísticas semanales', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.params.clienteId
    });
    res.status(400).json({ 
      message: 'Error al obtener estadísticas semanales', 
      error: (error as Error).message 
    });
  }
};

export const obtenerProgresoEjercicios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clienteId } = matchedData(req, { locations: ['params'] }) as { clienteId: string };
    const { ejercicioId } = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      ejercicioId?: string;
    };

    // Verificar que el usuario autenticado es un entrenador
    if (req.user?.role !== 'worker') {
      res.status(403).json({ message: 'Solo los entrenadores pueden acceder a las estadísticas de clientes' });
      return;
    }

    logger.debug('Obteniendo progreso de ejercicios', {
      clienteId,
      ejercicioId
    });

    const progreso = await obtenerProgresoEjerciciosService(clienteId, ejercicioId);

    logger.info('Progreso de ejercicios obtenido correctamente', { 
      clienteId, 
      cantidad: progreso.length 
    });
    res.status(200).json({ 
      success: true,
      message: 'Progreso de ejercicios obtenido correctamente', 
      progreso 
    });

  } catch (error) {
    logger.error('Error al obtener progreso de ejercicios', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.params.clienteId
    });
    res.status(400).json({ 
      message: 'Error al obtener progreso de ejercicios', 
      error: (error as Error).message 
    });
  }
};

// Endpoints para el cliente (su propio progreso)
export const obtenerMiProgreso = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { fechaInicio, fechaFin } = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      fechaInicio?: string;
      fechaFin?: string;
    };

    // Convertir fechas si se proporcionan
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

    logger.debug('Obteniendo progreso personal del cliente', {
      clienteId,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate
    });

    const estadisticas = await obtenerEstadisticasClienteService(
      clienteId,
      fechaInicioDate,
      fechaFinDate
    );


    logger.info('Progreso personal obtenido correctamente', { clienteId });
    res.status(200).json({ 
      success: true,
      message: 'Progreso personal obtenido correctamente', 
      estadisticas 
    });

  } catch (error) {
    logger.error('Error al obtener progreso personal', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.user?.id
    });
    res.status(400).json({ 
      message: 'Error al obtener progreso personal', 
      error: (error as Error).message 
    });
  }
};

export const obtenerMiProgresoSemanal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { numeroSemana, anio } = matchedData(req, { locations: ['query'] }) as {
      numeroSemana: string;
      anio: string;
    };

    const numeroSemanaNum = parseInt(numeroSemana);
    const anioNum = parseInt(anio);

    logger.debug('Obteniendo progreso semanal personal', {
      clienteId,
      numeroSemana: numeroSemanaNum,
      año: anioNum
    });

    const estadisticas = await obtenerEstadisticasSemanalService(
      clienteId,
      numeroSemanaNum,
      anioNum
    );

    logger.info('Progreso semanal personal obtenido correctamente', { 
      clienteId, 
      numeroSemana: numeroSemanaNum 
    });
    res.status(200).json({ 
      success: true,
      message: 'Progreso semanal personal obtenido correctamente', 
      estadisticas 
    });

  } catch (error) {
    logger.error('Error al obtener progreso semanal personal', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.user?.id
    });
    res.status(400).json({ 
      message: 'Error al obtener progreso semanal personal', 
      error: (error as Error).message 
    });
  }
};

export const obtenerMiProgresoEjercicios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { ejercicioId } = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      ejercicioId?: string;
    };

    logger.debug('Obteniendo progreso personal de ejercicios', {
      clienteId,
      ejercicioId
    });

    const progreso = await obtenerProgresoEjerciciosService(clienteId, ejercicioId);

    logger.info('Progreso personal de ejercicios obtenido correctamente', { 
      clienteId, 
      cantidad: progreso.length 
    });
    res.status(200).json({ 
      success: true,
      message: 'Progreso personal de ejercicios obtenido correctamente', 
      progreso 
    });

  } catch (error) {
    logger.error('Error al obtener progreso personal de ejercicios', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.user?.id
    });
    res.status(400).json({ 
      message: 'Error al obtener progreso personal de ejercicios', 
      error: (error as Error).message 
    });
  }
};

export const obtenerRachasEntrenamiento = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    logger.info('Obteniendo rachas de entrenamiento', { clienteId });

    const rachas = await obtenerRachasEntrenamientoService(clienteId);

    logger.info('Rachas de entrenamiento obtenidas correctamente', { 
      clienteId,
      rachaActual: rachas.rachaActual.dias,
      rachaMaxima: rachas.rachaMaxima.dias
    });

    res.status(200).json({ 
      success: true,
      rachas 
    });

  } catch (error) {
    logger.error('Error al obtener rachas de entrenamiento', {
      error: error instanceof Error ? error.message : String(error),
      clienteId: req.user?.id
    });
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: (error as Error).message 
    });
  }
};

// Obtener clientes del trabajador con sus estadísticas
export const obtenerClientesTrabajador = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { semana, año } = req.query;
    const trabajadorId = req.user?.id;

    if (!trabajadorId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (req.user?.role !== 'worker') {
      res.status(403).json({
        success: false,
        message: 'Solo los trabajadores pueden acceder a esta información'
      });
      return;
    }

    const semanaNum = semana ? parseInt(semana as string) : undefined;
    const añoNum = año ? parseInt(año as string) : undefined;

    const resultado = await obtenerClientesTrabajadorService(trabajadorId, semanaNum, añoNum);

    res.status(200).json({
      message: 'Datos de clientes obtenidos correctamente',
      ...resultado
    });

  } catch (error) {
    console.error('Error en obtenerClientesTrabajador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener detalles completos de un cliente específico
export const obtenerDetallesCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clienteId } = matchedData(req, { locations: ['params'] }) as { clienteId: string };
    const trabajadorId = req.user?.id;

    if (!trabajadorId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (req.user?.role !== 'worker') {
      res.status(403).json({
        success: false,
        message: 'Solo los trabajadores pueden acceder a esta información'
      });
      return;
    }
    
    const resultado = await obtenerDetallesClienteService(trabajadorId, clienteId);

    res.status(200).json({
      message: 'Detalles del cliente obtenidos correctamente',
      ...resultado
    });

  } catch (error) {
    console.error('Error en obtenerDetallesCliente:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
};
