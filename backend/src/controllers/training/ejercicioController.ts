import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearEjercicioService, 
  obtenerEjerciciosService, 
  obtenerEjercicioPorIdService,
  actualizarEjercicioService,
  eliminarEjercicioService
} from '../../service/training/ejercicioService';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';

export const crearEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const {
      nombre,
      descripcion,
      grupoMuscular,
      equipamiento,
      series,
      repeticiones,
      tiempoDescanso,
      nivelDificultad,
      nivelIntensidad,
      videoDemostrativo
    } = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      nombre: string;
      descripcion: string;
      grupoMuscular: string;
      equipamiento: string;
      series: number;
      repeticiones: number;
      tiempoDescanso: number;
      nivelDificultad: string;
      nivelIntensidad: string;
      videoDemostrativo?: string;
    };

    logger.debug('Procesando datos para crear ejercicio', {
      creadorId,
      nombre,
      grupoMuscular,
      equipamiento
    });

    const ejercicio = await crearEjercicioService({
      creadorId,
      nombre,
      descripcion,
      grupoMuscular,
      equipamiento,
      series,
      repeticiones,
      tiempoDescanso,
      nivelDificultad,
      nivelIntensidad,
      videoDemostrativo
    });

    logger.info('Ejercicio creado correctamente', { ejercicioId: ejercicio._id });
    res.status(201).json({ message: 'Ejercicio creado correctamente', ejercicio });
  } catch (error) {
    logger.error('Error al crear el ejercicio', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear el ejercicio', error: (error as Error).message });
  }
};

export const obtenerEjercicios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filtros = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      grupoMuscular?: string;
      nivelDificultad?: string;
      equipamiento?: string;
      creador?: string;
      publico?: boolean;
    };

    const ejercicios = await obtenerEjerciciosService(filtros);

    logger.info('Ejercicios obtenidos correctamente', { count: ejercicios.length });
    res.status(200).json({ ejercicios });
  } catch (error) {
    logger.error('Error al obtener ejercicios', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener ejercicios',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerEjercicioPorId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    const ejercicio = await obtenerEjercicioPorIdService(id);

    logger.info('Ejercicio obtenido correctamente', { ejercicioId: id });
    res.status(200).json({ ejercicio });
  } catch (error) {
    logger.error('Error al obtener ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(404).json({
      message: 'Error al obtener ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const actualizarEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const datosActualizacion = matchedData(req, { locations: ['body'], includeOptionals: true }) as Partial<{
      nombre: string;
      descripcion: string;
      grupoMuscular: string;
      equipamiento: string;
      series: number;
      repeticiones: number;
      tiempoDescanso: number;
      nivelDificultad: string;
      nivelIntensidad: string;
      videoDemostrativo: string;
    }>;

    logger.debug('Procesando actualización de ejercicio', {
      creadorId,
      ejercicioId: id,
      campos: Object.keys(datosActualizacion)
    });

    const ejercicio = await actualizarEjercicioService(id, creadorId, datosActualizacion);

    logger.info('Ejercicio actualizado correctamente', { ejercicioId: id });
    res.status(200).json({ message: 'Ejercicio actualizado correctamente', ejercicio });
  } catch (error) {
    logger.error('Error al actualizar ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const eliminarEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creadorId = req.user?.id;
    if (!creadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    logger.debug('Procesando eliminación de ejercicio', {
      creadorId,
      ejercicioId: id
    });

    const resultado = await eliminarEjercicioService(id, creadorId);

    logger.info('Ejercicio eliminado correctamente', { ejercicioId: id });
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al eliminar ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al eliminar ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};
