import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { 
  crearCitaService,
  obtenerCitasService,
  obtenerCitaPorIdService,
  actualizarCitaService,
  cancelarCitaService,
  reagendarCitaService,
  confirmarCitaService,
  completarCitaService,
  obtenerDisponibilidadProfesionalService,
  obtenerEstadisticasCitasService
} from '../../service/citas/citaService';
import { 
  verificarCitaExiste,
  verificarPermisosCita,
  verificarCitaEditable,
  manejarErrorCita
} from '../../validators/citaValidators';
import { verificarAutenticacion } from '../../validators/commonValidators';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';

// Crear una nueva cita
export const crearCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'crear cita');
    if (!usuarioId) return;

    const datos = matchedData(req, { locations: ['body'] }) as {
      cliente: string;
      profesional: string;
      tipo: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
      fecha: string;
      hora: string;
      duracion?: number;
      motivo: string;
    };

    // Verificar que el usuario es el cliente o tiene permisos
    if (datos.cliente !== usuarioId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Solo puedes crear citas para ti mismo' });
      return;
    }

    const cita = await crearCitaService(datos);

    logger.info('Cita creada correctamente', { citaId: cita._id, cliente: datos.cliente });
    res.status(201).json({ 
      message: 'Cita creada correctamente', 
      cita 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'crear la cita');
  }
};

// Obtener citas con filtros
export const obtenerCitas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'obtener citas');
    if (!usuarioId) return;

    const filtros = matchedData(req, { locations: ['query'] }) as {
      cliente?: string;
      profesional?: string;
      tipo?: string;
      estado?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      limit?: number;
      offset?: number;
      estadosActivos?: string; // Los query params llegan como strings
    };

    // Si no es admin, solo puede ver sus propias citas
    if (req.user?.role !== 'admin') {
      // Verificar si es cliente o profesional
      const esCliente = filtros.cliente === usuarioId;
      const esProfesional = filtros.profesional === usuarioId;
      
      if (!esCliente && !esProfesional) {
        // Si no especifica filtros, mostrar sus citas
        if (!filtros.cliente && !filtros.profesional) {
          // Determinar si es cliente o profesional basado en el rol
          if (req.user?.role === 'user') {
            filtros.cliente = usuarioId;
          } else if (req.user?.role === 'worker') {
            filtros.profesional = usuarioId;
          }
        } else {
          res.status(403).json({ message: 'No tienes permisos para ver estas citas' });
          return;
        }
      }
    }

    // Convertir fechas y booleanos si existen
    const filtrosProcesados = {
      ...filtros,
      fechaDesde: filtros.fechaDesde ? new Date(filtros.fechaDesde) : undefined,
      fechaHasta: filtros.fechaHasta ? new Date(filtros.fechaHasta) : undefined,
      estadosActivos: filtros.estadosActivos === 'true' ? true : filtros.estadosActivos === 'false' ? false : undefined
    };

    const resultado = await obtenerCitasService(filtrosProcesados);

    logger.info('Citas obtenidas correctamente', { 
      count: resultado.citas.length,
      usuarioId 
    });
    res.status(200).json({ 
      message: 'Citas obtenidas correctamente',
      ...resultado 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'obtener las citas');
  }
};

// Obtener una cita por ID
export const obtenerCitaPorId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'obtener cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos
    if (!verificarPermisosCita(cita, usuarioId, res, 'ver')) return;

    const citaCompleta = await obtenerCitaPorIdService(id);

    logger.info('Cita obtenida correctamente', { citaId: id });
    res.status(200).json({ cita: citaCompleta });
  } catch (error) {
    manejarErrorCita(error, res, 'obtener la cita', { citaId: req.params.id });
  }
};

// Actualizar una cita
export const actualizarCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'actualizar cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    const datos = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      tipo?: 'seguimiento' | 'consulta_nutricion' | 'consulta_entrenamiento' | 'evaluacion' | 'revision';
      fecha?: string;
      hora?: string;
      duracion?: number;
      motivo?: string;
      estado?: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'reagendada';
    };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos
    if (!verificarPermisosCita(cita, usuarioId, res, 'actualizar')) return;

    // Verificar que la cita puede ser editada
    if (!verificarCitaEditable(cita, res, 'actualizar')) return;

    const citaActualizada = await actualizarCitaService(id, datos);

    logger.info('Cita actualizada correctamente', { citaId: id });
    res.status(200).json({ 
      message: 'Cita actualizada correctamente', 
      cita: citaActualizada 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'actualizar la cita', { citaId: req.params.id });
  }
};

// Cancelar una cita
export const cancelarCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'cancelar cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    const { motivo } = matchedData(req, { locations: ['body'] }) as { motivo: string };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos
    if (!verificarPermisosCita(cita, usuarioId, res, 'cancelar')) return;

    const citaCancelada = await cancelarCitaService(id, motivo, usuarioId);

    logger.info('Cita cancelada correctamente', { citaId: id, motivo });
    res.status(200).json({ 
      message: 'Cita cancelada correctamente', 
      cita: citaCancelada 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'cancelar la cita', { citaId: req.params.id });
  }
};

// Reagendar una cita
export const reagendarCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'reagendar cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };
    const datos = matchedData(req, { locations: ['body'] }) as {
      nuevaFecha: string;
      nuevaHora: string;
      motivo?: string;
    };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos
    if (!verificarPermisosCita(cita, usuarioId, res, 'reagendar')) return;

    const nuevaCita = await reagendarCitaService(id, datos, usuarioId);

    logger.info('Cita reagendada correctamente', { 
      citaOriginal: id, 
      nuevaCita: nuevaCita._id 
    });
    res.status(200).json({ 
      message: 'Cita reagendada correctamente', 
      cita: nuevaCita 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'reagendar la cita', { citaId: req.params.id });
  }
};

// Confirmar una cita
export const confirmarCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'confirmar cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos (solo el profesional puede confirmar)
    if (cita.profesional.toString() !== usuarioId) {
      res.status(403).json({ message: 'Solo el profesional puede confirmar la cita' });
      return;
    }

    const citaConfirmada = await confirmarCitaService(id, usuarioId);

    logger.info('Cita confirmada correctamente', { citaId: id });
    res.status(200).json({ 
      message: 'Cita confirmada correctamente', 
      cita: citaConfirmada 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'confirmar la cita', { citaId: req.params.id });
  }
};

// Completar una cita
export const completarCita = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'completar cita');
    if (!usuarioId) return;

    const { id } = matchedData(req, { locations: ['params'] }) as { id: string };

    const cita = await verificarCitaExiste(id, res);
    if (!cita) return;

    // Verificar permisos (solo el profesional puede completar)
    if (cita.profesional.toString() !== usuarioId) {
      res.status(403).json({ message: 'Solo el profesional puede completar la cita' });
      return;
    }

    const citaCompletada = await completarCitaService(id, usuarioId);

    logger.info('Cita completada correctamente', { citaId: id });
    res.status(200).json({ 
      message: 'Cita completada correctamente', 
      cita: citaCompletada 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'completar la cita', { citaId: req.params.id });
  }
};


// Obtener disponibilidad de un profesional
export const obtenerDisponibilidadProfesional = async (
  req: AuthenticatedRequest, 
  res: Response
): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'obtener disponibilidad');
    if (!usuarioId) return;

    const { profesionalId } = matchedData(req, { locations: ['params'] }) as { 
      profesionalId: string 
    };
    const { fecha } = matchedData(req, { locations: ['query'] }) as { fecha: string };

    const disponibilidad = await obtenerDisponibilidadProfesionalService(profesionalId, fecha);

    logger.info('Disponibilidad obtenida correctamente', { 
      profesionalId, 
      fecha 
    });
    res.status(200).json({ 
      message: 'Disponibilidad obtenida correctamente', 
      disponibilidad 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'obtener la disponibilidad', { 
      profesionalId: req.params.profesionalId 
    });
  }
};

// Obtener estadísticas de citas
export const obtenerEstadisticasCitas = async (
  req: AuthenticatedRequest, 
  res: Response
): Promise<void> => {
  try {
    const usuarioId = verificarAutenticacion(req, res, 'obtener estadísticas');
    if (!usuarioId) return;

    const esProfesional = req.user?.role === 'worker';
    const estadisticas = await obtenerEstadisticasCitasService(usuarioId, esProfesional);

    logger.info('Estadísticas obtenidas correctamente', { 
      usuarioId, 
      esProfesional 
    });
    res.status(200).json({ 
      message: 'Estadísticas obtenidas correctamente', 
      estadisticas 
    });
  } catch (error) {
    manejarErrorCita(error, res, 'obtener las estadísticas');
  }
};
