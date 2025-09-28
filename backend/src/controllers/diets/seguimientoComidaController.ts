import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { verificarAutenticacion } from '../../validators/commonValidators';
import {
  actualizarSeguimientoPlatoService,
  obtenerSeguimientoPlatosService,
  obtenerEstadisticasSeguimientoService,
  obtenerEstadisticasGeneralesService,
  obtenerEstadisticasSemanalService,
  obtenerProgresoComidasService,
  obtenerRachasNutricionalesService
} from '../../service/diets/seguimientoComidaService';
import logger from '../../utils/logger';
import { manejarErrorComun } from '../../utils/errorHandler';

/**
 * Actualizar seguimiento de un plato específico
 * PUT /api/dietas/:dietaId/dias/:diaIndex/comidas/:comidaIndex/platos/:platoIndex/seguimiento
 */
export const actualizarSeguimientoPlato = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'actualizar seguimiento de plato');
    if (!userId) return;

    const { dietaId, diaIndex, comidaIndex, platoIndex } = req.params;
    const { satisfaccion, cumplimiento, notaUsuario } = req.body;

    logger.info('Actualizando seguimiento de plato', {
      userId,
      dietaId,
      diaIndex: parseInt(diaIndex),
      comidaIndex: parseInt(comidaIndex),
      platoIndex: parseInt(platoIndex),
      satisfaccion,
      cumplimiento
    });

    const resultado = await actualizarSeguimientoPlatoService({
      userId,
      dietaId,
      diaIndex: parseInt(diaIndex),
      comidaIndex: parseInt(comidaIndex),
      platoIndex: parseInt(platoIndex),
      satisfaccion,
      cumplimiento,
      notaUsuario
    });

    logger.info('Seguimiento de comida actualizado correctamente', {
      userId,
      dietaId,
      diaIndex: parseInt(diaIndex),
      comidaIndex: parseInt(comidaIndex)
    });

    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al actualizar seguimiento de comida', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      dietaId: req.params.dietaId,
      diaIndex: req.params.diaIndex,
      comidaIndex: req.params.comidaIndex
    });

    manejarErrorComun(error, res, 'actualizar seguimiento de plato');
  }
};

/**
 * Obtener seguimiento de platos de una dieta
 * GET /api/dietas/:dietaId/seguimiento
 */
export const obtenerSeguimientoPlatos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener seguimiento de platos');
    if (!userId) return;

    const { dietaId } = req.params;
    const {
      diaIndex,
      comidaIndex,
      satisfaccionMinima,
      cumplimientoMinimo,
      fechaDesde,
      fechaHasta,
      limit = 50,
      offset = 0
    } = req.query;

    logger.info('Obteniendo seguimiento de platos', {
      userId,
      dietaId,
      diaIndex: diaIndex ? parseInt(diaIndex as string) : undefined,
      comidaIndex: comidaIndex ? parseInt(comidaIndex as string) : undefined,
      satisfaccionMinima: satisfaccionMinima ? parseInt(satisfaccionMinima as string) : undefined,
      cumplimientoMinimo: cumplimientoMinimo ? parseInt(cumplimientoMinimo as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    const resultado = await obtenerSeguimientoPlatosService({
      userId,
      dietaId,
      diaIndex: diaIndex ? parseInt(diaIndex as string) : undefined,
      comidaIndex: comidaIndex ? parseInt(comidaIndex as string) : undefined,
      satisfaccionMinima: satisfaccionMinima ? parseInt(satisfaccionMinima as string) : undefined,
      cumplimientoMinimo: cumplimientoMinimo ? parseInt(cumplimientoMinimo as string) : undefined,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.status(200).json({
      message: 'Seguimiento de comidas obtenido correctamente',
      ...resultado
    });
  } catch (error) {
    logger.error('Error al obtener seguimiento de comidas', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      dietaId: req.params.dietaId
    });

    manejarErrorComun(error, res, 'obtener seguimiento de comidas');
  }
};

/**
 * Obtener estadísticas de seguimiento de una dieta
 * GET /api/dietas/:dietaId/estadisticas-seguimiento
 */
export const obtenerEstadisticasSeguimiento = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener estadísticas de seguimiento');
    if (!userId) return;

    const { dietaId } = req.params;
    const {
      fechaDesde,
      fechaHasta,
      incluirTendencias = false
    } = req.query;

    logger.info('Obteniendo estadísticas de seguimiento', {
      userId,
      dietaId,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      incluirTendencias: incluirTendencias === 'true'
    });

    const estadisticas = await obtenerEstadisticasSeguimientoService({
      userId,
      dietaId,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      incluirTendencias: incluirTendencias === 'true'
    });

    res.status(200).json({
      message: 'Estadísticas de seguimiento obtenidas correctamente',
      estadisticas
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas de seguimiento', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      dietaId: req.params.dietaId
    });

    manejarErrorComun(error, res, 'obtener estadísticas de seguimiento');
  }
};

/**
 * Obtener estadísticas generales de seguimiento nutricional
 * GET /api/diets-seguimiento/estadisticas-generales
 */
export const obtenerEstadisticasGenerales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener estadísticas generales');
    if (!userId) return;

    const { fechaDesde, fechaHasta } = req.query;

    logger.info('Obteniendo estadísticas generales', {
      userId,
      fechaDesde,
      fechaHasta
    });

    const estadisticas = await obtenerEstadisticasGeneralesService({
      userId,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined
    });

    logger.info('Estadísticas generales obtenidas correctamente', {
      userId
    });

    res.status(200).json(estadisticas);
  } catch (error) {
    logger.error('Error al obtener estadísticas generales', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });

    manejarErrorComun(error, res, 'obtener estadísticas generales');
  }
};

/**
 * Obtener estadísticas semanales de seguimiento nutricional
 * GET /api/diets-seguimiento/estadisticas-semanal
 */
export const obtenerEstadisticasSemanal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener estadísticas semanales');
    if (!userId) return;

    const { numeroSemana, año } = req.query;

    logger.info('Obteniendo estadísticas semanales', {
      userId,
      numeroSemana: parseInt(numeroSemana as string),
      año: parseInt(año as string)
    });

    const estadisticas = await obtenerEstadisticasSemanalService({
      userId,
      numeroSemana: parseInt(numeroSemana as string),
      año: parseInt(año as string)
    });

    logger.info('Estadísticas semanales obtenidas correctamente', {
      userId
    });

    res.status(200).json(estadisticas);
  } catch (error) {
    logger.error('Error al obtener estadísticas semanales', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });

    manejarErrorComun(error, res, 'obtener estadísticas semanales');
  }
};

/**
 * Obtener progreso de comidas específicas
 * GET /api/diets-seguimiento/progreso-comidas
 */
export const obtenerProgresoComidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener progreso de comidas');
    if (!userId) return;

    const { limite, offset, ordenarPor, orden } = req.query;

    logger.info('Obteniendo progreso de comidas', {
      userId,
      limite: limite ? parseInt(limite as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      ordenarPor,
      orden
    });

    const progreso = await obtenerProgresoComidasService({
      userId,
      limite: limite ? parseInt(limite as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
      ordenarPor: ordenarPor as string || 'satisfaccion',
      orden: orden as string || 'desc'
    });

    logger.info('Progreso de comidas obtenido correctamente', {
      userId
    });

    res.status(200).json(progreso);
  } catch (error) {
    logger.error('Error al obtener progreso de comidas', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });

    manejarErrorComun(error, res, 'obtener progreso de comidas');
  }
};

/**
 * Obtener rachas nutricionales del usuario
 * GET /api/diets-seguimiento/rachas-nutricionales
 */
export const obtenerRachasNutricionales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener rachas nutricionales');
    if (!userId) return;

    const { fechaDesde, fechaHasta } = req.query;

    logger.info('Obteniendo rachas nutricionales', {
      userId,
      fechaDesde,
      fechaHasta
    });

    const rachas = await obtenerRachasNutricionalesService();

    logger.info('Rachas nutricionales obtenidas correctamente', {
      userId
    });

    res.status(200).json(rachas);
  } catch (error) {
    logger.error('Error al obtener rachas nutricionales', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });

    manejarErrorComun(error, res, 'obtener rachas nutricionales');
  }
};
