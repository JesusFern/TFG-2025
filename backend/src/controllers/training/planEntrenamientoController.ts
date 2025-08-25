import { Response } from 'express';
import { matchedData } from 'express-validator';
import { AuthenticatedRequest } from '../../types';
import { 
  crearPlanEntrenamientoService, 
  obtenerPlanesEntrenamientoService, 
  obtenerPlanEntrenamientoPorIdService,
  actualizarPlanEntrenamientoService,
  eliminarPlanEntrenamientoService,
  asignarClienteService,
  removerClienteService
} from '../../service/training/planEntrenamientoService';
import logger from '../../utils/logger';

type PlanCreateAllowed = {
  entrenadorId: string;
  nombre: string;
  descripcion?: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  clientes: string[];
  publico: boolean;
};

type PlanUpdateAllowed = Partial<Omit<PlanCreateAllowed, 'entrenadorId'>>;

export const crearPlanEntrenamiento = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    // Extraer únicamente campos validados/sanitizados por express-validator
    const data = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      nombre: string;
      descripcion?: string;
      objetivo: string;
      duracionDias: number;
      sesionesPorSemana: number;
      clientes: string[];
      publico: boolean;
    };

    logger.debug('Procesando datos para crear plan de entrenamiento', {
      entrenadorId,
      nombre: data.nombre,
      objetivo: data.objetivo,
      duracionDias: data.duracionDias,
      sesionesPorSemana: data.sesionesPorSemana
    });

    const payload: PlanCreateAllowed = {
      entrenadorId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      objetivo: data.objetivo,
      duracionDias: data.duracionDias,
      sesionesPorSemana: data.sesionesPorSemana,
      clientes: Array.isArray(data.clientes) ? data.clientes : [],
      publico: data.publico
    };

    const plan = await crearPlanEntrenamientoService(payload);

    logger.info('Plan de entrenamiento creado correctamente', { planId: plan._id });
    res.status(201).json({ message: 'Plan de entrenamiento creado correctamente', plan });
  } catch (error) {
    logger.error('Error al crear el plan de entrenamiento', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear el plan de entrenamiento', error: (error as Error).message });
  }
};

export const obtenerPlanesEntrenamiento = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Extraer solo filtros validados
    const filtros = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      entrenador?: string;
      cliente?: string;
      objetivo?: string;
      publico?: boolean;
      activo?: boolean;
    };

    const planes = await obtenerPlanesEntrenamientoService(filtros);

    logger.info('Planes de entrenamiento obtenidos correctamente', { count: planes.length });
    res.status(200).json({ planes });
  } catch (error) {
    logger.error('Error al obtener planes de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener planes de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerPlanEntrenamientoPorId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    const plan = await obtenerPlanEntrenamientoPorIdService(id);

    logger.info('Plan de entrenamiento obtenido correctamente', { planId: id });
    res.status(200).json({ plan });
  } catch (error) {
    logger.error('Error al obtener plan de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(404).json({
      message: 'Error al obtener plan de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const actualizarPlanEntrenamiento = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    // Extraer únicamente campos actualizables validados
    const update = matchedData(req, { locations: ['body'], includeOptionals: true }) as PlanUpdateAllowed;

    logger.debug('Procesando actualización de plan de entrenamiento', {
      entrenadorId,
      planId: id,
      campos: Object.keys(update)
    });

    const plan = await actualizarPlanEntrenamientoService(id, entrenadorId, update);

    logger.info('Plan de entrenamiento actualizado correctamente', { planId: id });
    res.status(200).json({ message: 'Plan de entrenamiento actualizado correctamente', plan });
  } catch (error) {
    logger.error('Error al actualizar plan de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar plan de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const eliminarPlanEntrenamiento = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    logger.debug('Procesando eliminación de plan de entrenamiento', {
      entrenadorId,
      planId: id
    });

    const resultado = await eliminarPlanEntrenamientoService(id, entrenadorId);

    logger.info('Plan de entrenamiento eliminado correctamente', { planId: id });
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al eliminar plan de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al eliminar plan de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const asignarCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const { clienteId } = req.body;

    logger.debug('Procesando asignación de cliente', {
      entrenadorId,
      planId: id,
      clienteId
    });

    const plan = await asignarClienteService(id, entrenadorId, clienteId);

    logger.info('Cliente asignado correctamente', { planId: id, clienteId });
    res.status(200).json({ message: 'Cliente asignado correctamente', plan });
  } catch (error) {
    logger.error('Error al asignar cliente', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al asignar cliente',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const removerCliente = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id, clienteId } = req.params;

    logger.debug('Procesando remoción de cliente', {
      entrenadorId,
      planId: id,
      clienteId
    });

    const plan = await removerClienteService(id, entrenadorId, clienteId);

    logger.info('Cliente removido correctamente', { planId: id, clienteId });
    res.status(200).json({ message: 'Cliente removido correctamente', plan });
  } catch (error) {
    logger.error('Error al remover cliente', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al remover cliente',
      error: error instanceof Error ? error.message : error
    });
  }
};
