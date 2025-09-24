import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearEjercicioService, 
  obtenerEjerciciosService, 
  obtenerEjercicioPorIdService,
  obtenerEjercicioPorSlugService,
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
      slug,
      descripcion,
      grupoMuscular,
      equipamiento,
      nivelDificultad,
      tipoEjercicio,
      instrucciones,
      publico
    } = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      nombre: string;
      slug: string;
      descripcion: string;
      grupoMuscular: string;
      equipamiento: string;
      nivelDificultad: string;
      tipoEjercicio: string;
      instrucciones?: string;
      publico?: boolean;
    };

    // Manejar video subido
    let videoDemostrativo: string | undefined;
    if (req.file) {
      // Construir URL del video subido
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      videoDemostrativo = `${baseUrl}/uploads/videos/${req.file.filename}`;
    }

    logger.debug('Procesando datos para crear ejercicio', {
      creadorId,
      nombre,
      grupoMuscular,
      equipamiento
    });

    const ejercicio = await crearEjercicioService({
      creadorId,
      nombre,
      slug,
      descripcion,
      grupoMuscular,
      equipamiento,
      nivelDificultad,
      tipoEjercicio,
      instrucciones,
      videoDemostrativo,
      publico
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
      tipoEjercicio?: string;
      creador?: string;
      publico?: boolean;
      arquetipo?: boolean;
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

export const obtenerEjercicioPorSlug = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = matchedData(req, { locations: ['params'] }) as { slug: string };

    const ejercicio = await obtenerEjercicioPorSlugService(slug);

    logger.info('Ejercicio obtenido correctamente', { slug });
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

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    const datosActualizacion = matchedData(req, { locations: ['body'], includeOptionals: true }) as Partial<{
      nombre: string;
      slug: string;
      descripcion: string;
      grupoMuscular: string;
      equipamiento: string;
      nivelDificultad: string;
      tipoEjercicio: string;
      instrucciones: string;
      videoDemostrativo: string;
      publico: boolean;
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
