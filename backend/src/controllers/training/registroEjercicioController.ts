import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearRegistroEjercicioService,
  obtenerRegistrosEjercicioService,
  obtenerRegistroEjercicioPorIdService,
  actualizarRegistroEjercicioService,
  eliminarRegistroEjercicioService,
  marcarRegistroCompletadoService,
  obtenerProgresoEjercicioService,
  verificarSesionCompletaService
} from '../../service/training/registroEjercicioService';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';

export const crearRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const {
      ejercicio,
      sesion,
      cargaUtilizada,
      repeticionesRealizadas,
      seriesCompletadas,
      nivelEsfuerzo,
      videoCliente,
      notas,
      tiempoDescanso,
      duracionEjercicio,
      ordenEnSesion,
      completado
    } = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      ejercicio: string;
      sesion: string;
      cargaUtilizada?: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      videoCliente?: string;
      notas?: string;
      tiempoDescanso?: number;
      duracionEjercicio?: number;
      ordenEnSesion?: number;
      completado?: boolean;
    };

    logger.debug('Procesando datos para crear registro de ejercicio', {
      clienteId,
      ejercicio,
      sesion,
      nivelEsfuerzo
    });

    const registro = await crearRegistroEjercicioService({
      ejercicioId: ejercicio,
      sesionId: sesion,
      clienteId,
      cargaUtilizada,
      repeticionesRealizadas,
      seriesCompletadas,
      nivelEsfuerzo,
      videoCliente,
      notas,
      tiempoDescanso,
      duracionEjercicio,
      ordenEnSesion,
      completado
    });

    logger.info('Registro de ejercicio creado correctamente', { registroId: registro._id });
    res.status(201).json({ message: 'Registro de ejercicio creado correctamente', registro });
  } catch (error) {
    logger.error('Error al crear registro de ejercicio', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear registro de ejercicio', error: (error as Error).message });
  }
};

export const obtenerRegistrosEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const filtros = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      sesion?: string;
      cliente?: string;
      ejercicio?: string;
      completado?: boolean;
      fecha?: string;
      fechaDesde?: string;
      fechaHasta?: string;
    };

    // Si no se especifica cliente, usar el cliente autenticado
    if (!filtros.cliente) {
      filtros.cliente = clienteId;
    }

    // Verificar que el cliente solo puede ver sus propios registros
    if (filtros.cliente !== clienteId) {
      res.status(403).json({ message: 'No tienes permisos para ver registros de otros clientes' });
      return;
    }

    const registros = await obtenerRegistrosEjercicioService(filtros);

    logger.info('Registros de ejercicio obtenidos correctamente', { 
      clienteId, 
      cantidad: registros.length 
    });
    res.status(200).json({ registros });
  } catch (error) {
    logger.error('Error al obtener registros de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener registros de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerRegistroEjercicioPorId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const registro = await obtenerRegistroEjercicioPorIdService(id);

    // Verificar que el cliente solo puede ver sus propios registros
    if (registro.cliente._id.toString() !== clienteId) {
      res.status(403).json({ message: 'No tienes permisos para ver este registro' });
      return;
    }

    logger.info('Registro de ejercicio obtenido correctamente', { registroId: id });
    res.status(200).json({ registro });
  } catch (error) {
    logger.error('Error al obtener registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(404).json({
      message: 'Error al obtener registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const actualizarRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const datosActualizacion = matchedData(req, { locations: ['body'], includeOptionals: true }) as Partial<{
      cargaUtilizada: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      videoCliente: string;
      notas: string;
      tiempoDescanso: number;
      duracionEjercicio: number;
      completado: boolean;
    }>;

    logger.debug('Procesando datos para actualizar registro de ejercicio', {
      clienteId,
      registroId: id,
      datosActualizacion
    });

    const registro = await actualizarRegistroEjercicioService(id, clienteId, datosActualizacion);

    logger.info('Registro de ejercicio actualizado correctamente', { registroId: id });
    res.status(200).json({ message: 'Registro de ejercicio actualizado correctamente', registro });
  } catch (error) {
    logger.error('Error al actualizar registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const eliminarRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const resultado = await eliminarRegistroEjercicioService(id, clienteId);

    logger.info('Registro de ejercicio eliminado correctamente', { registroId: id });
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al eliminar registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al eliminar registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const marcarRegistroCompletado = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const registro = await marcarRegistroCompletadoService(id, clienteId);

    logger.info('Registro de ejercicio marcado como completado', { registroId: id });
    res.status(200).json({ message: 'Registro marcado como completado correctamente', registro });
  } catch (error) {
    logger.error('Error al marcar registro como completado', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al marcar registro como completado',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerProgresoEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { ejercicioId } = req.params;
    const { fechaDesde, fechaHasta } = req.query;

    const progreso = await obtenerProgresoEjercicioService(
      ejercicioId, 
      clienteId, 
      fechaDesde as string, 
      fechaHasta as string
    );

    logger.info('Progreso de ejercicio obtenido correctamente', { 
      ejercicioId, 
      clienteId,
      cantidad: progreso.length 
    });
    res.status(200).json({ progreso });
  } catch (error) {
    logger.error('Error al obtener progreso de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener progreso de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const verificarSesionCompleta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { sesionId } = req.params;

    const verificacion = await verificarSesionCompletaService(sesionId, clienteId);

    logger.info('Verificación de sesión completada', { 
      sesionId, 
      clienteId,
      sesionCompleta: verificacion.sesionCompleta 
    });
    res.status(200).json(verificacion);
  } catch (error) {
    logger.error('Error al verificar sesión completa', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al verificar sesión completa',
      error: error instanceof Error ? error.message : error
    });
  }
};
