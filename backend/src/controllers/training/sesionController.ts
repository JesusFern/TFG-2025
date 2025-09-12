import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import Sesion from '../../models/training/sesion';
import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import { 
  crearSesionService, 
  obtenerSesionesService, 
  obtenerSesionPorIdService,
  actualizarSesionService,
  eliminarSesionService,
  marcarSesionCompletadaService,
  agregarNotasSesionService
} from '../../service/training/sesionService';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';
import mongoose from 'mongoose';

async function verificarPlanPublicado(sesionId: string): Promise<boolean> {
  // Validar que el sesionId sea un ObjectId válido antes de usarlo en la consulta
  if (!mongoose.Types.ObjectId.isValid(sesionId)) {
    logger.warn('ID de sesión inválido proporcionado', { sesionId });
    return false;
  }

  try {
    const plan = await PlanEntrenamiento.findOne({ 
      sesiones: new mongoose.Types.ObjectId(sesionId),
      draftMode: false 
    });
    return !!plan;
  } catch (error) {
    logger.error('Error al verificar si el plan está publicado', { 
      sesionId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
}

export const crearSesion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { 
      clienteId, 
      planId, 
      fecha, 
      hora, 
      tipoEntrenamiento, 
      duracion, 
      ejercicios 
    } = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      clienteId: string;
      planId?: string;
      fecha: string;
      hora?: string;
      tipoEntrenamiento: string;
      duracion: number;
      ejercicios: Array<{
        ejercicio: string;
        orden: number;
        series: number;
        repeticiones: number;
        peso?: number;
        tiempoDescanso: number;
        ejerciciosAlternativos?: string[];
        opcionesProgresion?: {
          aumentarPeso: boolean;
          masRepeticiones: boolean;
          mayorIntensidad: boolean;
        };
      }>;
    };

    logger.debug('Procesando datos para crear sesión', {
      entrenadorId,
      clienteId,
      planId,
      tipoEntrenamiento,
      duracion
    });

    const sesion = await crearSesionService({
      entrenadorId,
      clienteId,
      planId,
      fecha,
      hora,
      tipoEntrenamiento,
      duracion,
      ejercicios
    });

    logger.info('Sesión creada correctamente', { sesionId: sesion._id });
    res.status(201).json({ message: 'Sesión creada correctamente', sesion });
  } catch (error) {
    logger.error('Error al crear la sesión', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear la sesión', error: (error as Error).message });
  }
};

export const obtenerSesiones = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filtros = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      entrenador?: string;
      cliente?: string;
      plan?: string;
      fecha?: string;
      tipoEntrenamiento?: string;
      completada?: boolean;
    };

    const sesiones = await obtenerSesionesService(filtros);

    logger.info('Sesiones obtenidas correctamente', { count: sesiones.length });
    res.status(200).json({ sesiones });
  } catch (error) {
    logger.error('Error al obtener sesiones', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener sesiones',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerSesionPorId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sesion = await obtenerSesionPorIdService(id);

    logger.info('Sesión obtenida correctamente', { sesionId: id });
    res.status(200).json({ sesion });
  } catch (error) {
    logger.error('Error al obtener sesión', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(404).json({
      message: 'Error al obtener sesión',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const actualizarSesion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const datosActualizacion = matchedData(req, { locations: ['body'], includeOptionals: true }) as Partial<{
      fecha: string;
      hora: string;
      tipoEntrenamiento: string;
      duracion: number;
      ejercicios: Array<{
        ejercicio: string;
        orden: number;
        series: number;
        repeticiones: number;
        peso?: number;
        tiempoDescanso: number;
        ejerciciosAlternativos?: string[];
        opcionesProgresion?: {
          aumentarPeso: boolean;
          masRepeticiones: boolean;
          mayorIntensidad: boolean;
        };
      }>;
      notas: string;
    }>;

    logger.debug('Procesando actualización de sesión', {
      entrenadorId,
      sesionId: id,
      campos: Object.keys(datosActualizacion)
    });

    const sesionExistente = await Sesion.findById(id);
    if (!sesionExistente) {
      res.status(404).json({ message: 'Sesión no encontrada' });
      return;
    }

    const esPlanPublicado = await verificarPlanPublicado(id);
    if (esPlanPublicado) {
      res.status(403).json({ message: 'No se puede editar una sesión de un plan publicado' });
      return;
    }

    const sesion = await actualizarSesionService(id, entrenadorId, datosActualizacion);

    logger.info('Sesión actualizada correctamente', { sesionId: id });
    res.status(200).json({ message: 'Sesión actualizada correctamente', sesion });
  } catch (error) {
    logger.error('Error al actualizar sesión', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar sesión',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const eliminarSesion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    logger.debug('Procesando eliminación de sesión', {
      entrenadorId,
      sesionId: id
    });

    const sesionExistente = await Sesion.findById(id);
    if (!sesionExistente) {
      res.status(404).json({ message: 'Sesión no encontrada' });
      return;
    }

    const esPlanPublicado = await verificarPlanPublicado(id);
    if (esPlanPublicado) {
      res.status(403).json({ message: 'No se puede eliminar una sesión de un plan publicado' });
      return;
    }

    const resultado = await eliminarSesionService(id, entrenadorId);

    logger.info('Sesión eliminada correctamente', { sesionId: id });
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al eliminar sesión', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al eliminar sesión',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const marcarSesionCompletada = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    logger.debug('Procesando marcado de sesión como completada', {
      clienteId,
      sesionId: id
    });

    const sesion = await marcarSesionCompletadaService(id, clienteId);

    logger.info('Sesión marcada como completada', { sesionId: id });
    res.status(200).json({ message: 'Sesión marcada como completada', sesion });
  } catch (error) {
    logger.error('Error al marcar sesión como completada', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al marcar sesión como completada',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const agregarNotasSesion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const { notas } = matchedData(req, { locations: ['body'] }) as { notas: string };

    logger.debug('Procesando agregado de notas a sesión', {
      clienteId,
      sesionId: id,
      notas
    });

    const sesion = await agregarNotasSesionService(id, clienteId, notas);

    logger.info('Notas agregadas a sesión correctamente', { sesionId: id });
    res.status(200).json({ message: 'Notas agregadas correctamente', sesion });
  } catch (error) {
    logger.error('Error al agregar notas a sesión', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al agregar notas a sesión',
      error: error instanceof Error ? error.message : error
    });
  }
};
