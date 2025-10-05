import { Response } from 'express';
import { matchedData } from 'express-validator';
import { AuthenticatedRequest } from '../../types';
import PlanEntrenamiento from '../../models/training/planEntrenamiento';
import { 
  crearPlanEntrenamientoService, 
  obtenerPlanesEntrenamientoService, 
  obtenerPlanEntrenamientoPorIdService,
  actualizarPlanEntrenamientoService,
  eliminarPlanEntrenamientoService,
  asignarClienteService,
  removerClienteService,
  obtenerObjetivosDisponiblesService,
  obtenerPlantillaPorObjetivoService,
  obtenerPlantillasPorFiltrosService,
  buscarPlantillasService,
  generarPlanDesdePlantillaService,
  publicarPlanEntrenamientoService
} from '../../service/training/planEntrenamientoService';
import logger from '../../utils/logger';

type PlanCreateAllowed = {
  entrenadorId: string;
  nombre: string;
  descripcion?: string;
  objetivo: string;
  duracionDias: number;
  sesionesPorSemana: number;
  fechaInicio: string;
  diasSemana: number[];
  clientes: string[];
  publico: boolean;
  crearSesionesAutomaticamente?: boolean;
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
      fechaInicio: string;
      diasSemana: number[];
      clientes: string[];
      publico: boolean;
      crearSesionesAutomaticamente?: boolean;
    };

    logger.debug('Procesando datos para crear plan de entrenamiento', {
      entrenadorId,
      nombre: data.nombre,
      objetivo: data.objetivo,
      duracionDias: data.duracionDias,
      sesionesPorSemana: data.sesionesPorSemana,
      crearSesionesAutomaticamente: data.crearSesionesAutomaticamente
    });

    const payload: PlanCreateAllowed = {
      entrenadorId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      objetivo: data.objetivo,
      duracionDias: data.duracionDias,
      sesionesPorSemana: data.sesionesPorSemana,
      fechaInicio: data.fechaInicio,
      diasSemana: data.diasSemana,
      clientes: Array.isArray(data.clientes) ? data.clientes : [],
      publico: data.publico,
      crearSesionesAutomaticamente: data.crearSesionesAutomaticamente
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
    console.error('Error al obtener planes de entrenamiento:', error);
    logger.error('Error al obtener planes de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener planes de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerMisPlanes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    // Obtener solo los planes creados por el usuario actual
    const planes = await obtenerPlanesEntrenamientoService({ entrenador: entrenadorId });

    logger.info('Mis planes de entrenamiento obtenidos correctamente', { 
      entrenadorId, 
      count: planes.length 
    });
    res.status(200).json({ planes });
  } catch (error) {
    logger.error('Error al obtener mis planes de entrenamiento', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ 
      message: 'Error al obtener mis planes de entrenamiento', 
      error: (error as Error).message 
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

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    // Extraer únicamente campos actualizables validados
    const update = matchedData(req, { locations: ['body'], includeOptionals: true }) as PlanUpdateAllowed;

    logger.debug('Procesando actualización de plan de entrenamiento', {
      entrenadorId,
      planId: id,
      campos: Object.keys(update)
    });

    // Verificar que el plan existe
    const planExistente = await PlanEntrenamiento.findById(id);
    if (!planExistente) {
      res.status(404).json({ message: 'Plan de entrenamiento no encontrado' });
      return;
    }

    // Verificar que el entrenador tiene acceso al plan
    if (planExistente.entrenador.toString() !== entrenadorId) {
      res.status(403).json({ message: 'No tienes permisos para editar este plan' });
      return;
    }

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

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    logger.debug('Procesando eliminación de plan de entrenamiento', {
      entrenadorId,
      planId: id
    });

    // Verificar que el plan existe y no está publicado
    const planExistente = await PlanEntrenamiento.findById(id);
    if (!planExistente) {
      res.status(404).json({ message: 'Plan de entrenamiento no encontrado' });
      return;
    }

    if (!planExistente.draftMode) {
      res.status(403).json({ message: 'No se puede eliminar un plan de entrenamiento publicado' });
      return;
    }

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

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    const { clienteId } = matchedData(req, { locations: ['body'] }) as { clienteId: string };

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

    const { id, clienteId } = matchedData(req, { locations: ['params'] }) as { id: string; clienteId: string };

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

export const publicarPlanEntrenamiento = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const planId = req.params.id;

    logger.debug('Solicitud para publicar plan de entrenamiento', { 
      planId, 
      entrenadorId
    });

    const plan = await publicarPlanEntrenamientoService(planId, entrenadorId);

    logger.info('Plan de entrenamiento publicado correctamente', { planId });
    res.status(200).json({ 
      message: 'Plan de entrenamiento publicado correctamente', 
      plan 
    });
  } catch (error) {
    logger.error('Error al publicar plan de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al publicar plan de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

// ===== CONTROLADORES DE PLANTILLAS =====

// Obtener todos los objetivos disponibles
export const obtenerObjetivosDisponibles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const objetivos = await obtenerObjetivosDisponiblesService();
    res.json({
      message: 'Objetivos de entrenamiento obtenidos correctamente',
      objetivos
    });
  } catch (error) {
    logger.error('Error al obtener objetivos de entrenamiento', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener objetivos de entrenamiento',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Obtener plantilla por objetivo específico
export const obtenerPlantillaPorObjetivo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { objetivo } = req.params;
    const plantilla = await obtenerPlantillaPorObjetivoService(objetivo);
    
    if (!plantilla) {
      res.status(404).json({
        message: 'Objetivo de entrenamiento no encontrado'
      });
      return;
    }

    res.json({
      message: 'Plantilla obtenida correctamente',
      plantilla
    });
  } catch (error) {
    logger.error('Error al obtener plantilla por objetivo', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener plantilla por objetivo',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Obtener plantillas por filtros
export const obtenerPlantillasPorFiltros = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { objetivo, nivelDificultad, equipamiento, gruposMusculares } = req.query;
    
    const filtros: {
      objetivo?: string;
      nivelDificultad?: string;
      equipamiento?: string[];
      gruposMusculares?: string[];
    } = {};
    if (objetivo && typeof objetivo === 'string') filtros.objetivo = objetivo;
    if (nivelDificultad && typeof nivelDificultad === 'string') filtros.nivelDificultad = nivelDificultad;
    if (equipamiento) {
      filtros.equipamiento = Array.isArray(equipamiento) 
        ? equipamiento.filter((item): item is string => typeof item === 'string')
        : [equipamiento].filter((item): item is string => typeof item === 'string');
    }
    if (gruposMusculares) {
      filtros.gruposMusculares = Array.isArray(gruposMusculares) 
        ? gruposMusculares.filter((item): item is string => typeof item === 'string')
        : [gruposMusculares].filter((item): item is string => typeof item === 'string');
    }

    const plantillas = await obtenerPlantillasPorFiltrosService(filtros);
    res.json({
      message: 'Plantillas obtenidas correctamente',
      plantillas,
      total: plantillas.length
    });
  } catch (error) {
    logger.error('Error al obtener plantillas por filtros', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener plantillas por filtros',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Buscar plantillas por texto
export const buscarPlantillas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { termino } = req.query;
    
    if (!termino || typeof termino !== 'string') {
      res.status(400).json({
        message: 'Término de búsqueda es requerido'
      });
      return;
    }

    const plantillas = await buscarPlantillasService(termino);
    res.json({
      message: 'Búsqueda de plantillas completada',
      plantillas,
      total: plantillas.length,
      termino
    });
  } catch (error) {
    logger.error('Error al buscar plantillas', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al buscar plantillas',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Generar plan desde plantilla
export const generarPlanDesdePlantilla = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entrenadorId = req.user?.id;
    if (!entrenadorId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { objetivo, duracionSemanas, sesionesPorSemana, nombre, descripcion, fechaInicio, diasSemana, clientes, publico, nivelDificultad } = req.body;

    if (!objetivo || !duracionSemanas || !sesionesPorSemana || !nombre || !fechaInicio || !diasSemana || !clientes) {
      res.status(400).json({
        message: 'Faltan campos requeridos: objetivo, duracionSemanas, sesionesPorSemana, nombre, fechaInicio, diasSemana, clientes'
      });
      return;
    }

    const resultado = await generarPlanDesdePlantillaService({
      entrenadorId,
      objetivo,
      duracionSemanas,
      sesionesPorSemana,
      nombre,
      descripcion,
      fechaInicio,
      diasSemana,
      clientes,
      publico,
      nivelDificultad
    });

    logger.info('Plan generado desde plantilla correctamente', {
      planId: resultado.plan._id,
      objetivoUsado: resultado.plantillaUsada.objetivo
    });

    res.status(201).json({
      message: 'Plan generado desde plantilla correctamente',
      plan: resultado.plan,
      sesionesCreadas: resultado.sesionesCreadas.length,
      plantillaUsada: resultado.plantillaUsada
    });
  } catch (error) {
    logger.error('Error al generar plan desde plantilla', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al generar plan desde plantilla',
      error: error instanceof Error ? error.message : error
    });
  }
};