import Valoracion from '../../models/valoraciones/valoracion';
import User from '../../models/users/user';
import mongoose from 'mongoose';
import logger from '../../utils/logger';

export interface CreateValoracionData {
  cliente: string;
  trabajador: string;
  calificacion: number;
  descripcion: string;
  tipoTrabajador: 'Nutricionista' | 'Entrenador personal';
  fechaValoracion?: Date;
}

export interface UpdateValoracionData {
  calificacion?: number;
  descripcion?: string;
  activa?: boolean;
}

export interface ValoracionFilters {
  trabajadorId?: string;
  clienteId?: string;
  tipoTrabajador?: 'Nutricionista' | 'Entrenador personal';
  calificacionMin?: number;
  calificacionMax?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  activa?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'fechaValoracion' | 'calificacion' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ValoracionStats {
  totalValoraciones: number;
  calificacionPromedio: number;
  distribucionCalificaciones: {
    [key: number]: number;
  };
  valoracionesPorTipo: {
    Nutricionista: number;
    'Entrenador personal': number;
  };
  valoracionesRecientes: number; // Últimos 30 días
}

export class ValoracionService {
  /**
   * Crear una nueva valoración
   */
  static async createValoracion(data: CreateValoracionData) {
    try {
      // Verificar que no existe ya una valoración activa del mismo cliente al mismo trabajador para el mismo tipo
      const valoracionExistente = await Valoracion.findOne({
        cliente: data.cliente,
        trabajador: data.trabajador,
        tipoTrabajador: data.tipoTrabajador,
        activa: true
      });

      if (valoracionExistente) {
        throw new Error(`Ya existe una valoración activa para este trabajador como ${data.tipoTrabajador}`);
      }

      const valoracion = new Valoracion({
        ...data,
        fechaValoracion: data.fechaValoracion || new Date()
      });

      await valoracion.save();
      
      // Poblar los datos del cliente y trabajador
      await valoracion.populate([
        { path: 'cliente', select: 'fullName email profilePicture' },
        { path: 'trabajador', select: 'fullName email profilePicture workerType' }
      ]);

      logger.info('Valoración creada exitosamente', { 
        valoracionId: valoracion._id,
        cliente: data.cliente,
        trabajador: data.trabajador
      });

      return valoracion;
    } catch (error) {
      logger.error('Error al crear valoración', { error, data });
      throw error;
    }
  }

  /**
   * Obtener valoraciones con filtros y paginación
   */
  static async getValoraciones(filters: ValoracionFilters = {}) {
    try {
      const {
        trabajadorId,
        clienteId,
        tipoTrabajador,
        calificacionMin,
        calificacionMax,
        fechaDesde,
        fechaHasta,
        activa,
        page = 1,
        limit = 10,
        sortBy = 'fechaValoracion',
        sortOrder = 'desc'
      } = filters;

      // Construir filtros de consulta
      const query: Record<string, unknown> = {};

      if (trabajadorId) {
        query.trabajador = new mongoose.Types.ObjectId(trabajadorId);
      }

      if (clienteId) {
        query.cliente = new mongoose.Types.ObjectId(clienteId);
      }

      if (tipoTrabajador) {
        query.tipoTrabajador = tipoTrabajador;
      }

      if (calificacionMin !== undefined || calificacionMax !== undefined) {
        const calificacionQuery: Record<string, number> = {};
        if (calificacionMin !== undefined) {
          calificacionQuery.$gte = calificacionMin;
        }
        if (calificacionMax !== undefined) {
          calificacionQuery.$lte = calificacionMax;
        }
        if (Object.keys(calificacionQuery).length > 0) {
          query.calificacion = calificacionQuery;
        }
      }

      if (fechaDesde || fechaHasta) {
        const fechaValoracionQuery: Record<string, Date> = {};
        if (fechaDesde) {
          fechaValoracionQuery.$gte = fechaDesde;
        }
        if (fechaHasta) {
          fechaValoracionQuery.$lte = fechaHasta;
        }
        if (Object.keys(fechaValoracionQuery).length > 0) {
          query.fechaValoracion = fechaValoracionQuery;
        }
      }

      if (activa !== undefined) {
        query.activa = activa;
      }

      // Configurar ordenamiento
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta con paginación
      const [valoraciones, total] = await Promise.all([
        Valoracion.find(query)
          .populate('cliente', 'fullName email profilePicture')
          .populate('trabajador', 'fullName email profilePicture workerType')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Valoracion.countDocuments(query)
      ]);

      return {
        valoraciones,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener valoraciones', { error, filters });
      throw error;
    }
  }

  /**
   * Obtener una valoración por ID
   */
  static async getValoracionById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de valoración inválido');
      }

      const valoracion = await Valoracion.findById(id)
        .populate('cliente', 'fullName email profilePicture')
        .populate('trabajador', 'fullName email profilePicture workerType');

      if (!valoracion) {
        throw new Error('Valoración no encontrada');
      }

      return valoracion;
    } catch (error) {
      logger.error('Error al obtener valoración por ID', { error, id });
      throw error;
    }
  }

  /**
   * Actualizar una valoración
   */
  static async updateValoracion(id: string, data: UpdateValoracionData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de valoración inválido');
      }

      const valoracion = await Valoracion.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate([
        { path: 'cliente', select: 'fullName email profilePicture' },
        { path: 'trabajador', select: 'fullName email profilePicture workerType' }
      ]);

      if (!valoracion) {
        throw new Error('Valoración no encontrada');
      }

      logger.info('Valoración actualizada exitosamente', { 
        valoracionId: id,
        data 
      });

      return valoracion;
    } catch (error) {
      logger.error('Error al actualizar valoración', { error, id, data });
      throw error;
    }
  }

  /**
   * Eliminar una valoración (hard delete)
   */
  static async deleteValoracion(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de valoración inválido');
      }

      // Hard delete - eliminar completamente la valoración
      const valoracion = await Valoracion.findByIdAndDelete(id);

      if (!valoracion) {
        throw new Error('Valoración no encontrada');
      }

      logger.info('Valoración eliminada exitosamente (hard delete)', { valoracionId: id });
      return valoracion;
    } catch (error) {
      logger.error('Error al eliminar valoración', { error, id });
      throw error;
    }
  }

  /**
   * Eliminar permanentemente una valoración
   */
  static async hardDeleteValoracion(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID de valoración inválido');
      }

      const valoracion = await Valoracion.findByIdAndDelete(id);

      if (!valoracion) {
        throw new Error('Valoración no encontrada');
      }

      logger.info('Valoración eliminada permanentemente', { valoracionId: id });
      return valoracion;
    } catch (error) {
      logger.error('Error al eliminar permanentemente valoración', { error, id });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de valoraciones
   */
  static async getValoracionStats(filters: {
    trabajadorId?: string;
    tipoTrabajador?: 'Nutricionista' | 'Entrenador personal';
    fechaDesde?: Date;
    fechaHasta?: Date;
  } = {}): Promise<ValoracionStats> {
    try {
      const { trabajadorId, tipoTrabajador, fechaDesde, fechaHasta } = filters;

      // Construir filtros de consulta
      const query: Record<string, unknown> = { activa: true };

      if (trabajadorId) {
        query.trabajador = new mongoose.Types.ObjectId(trabajadorId);
      }

      if (tipoTrabajador) {
        query.tipoTrabajador = tipoTrabajador;
      }

      if (fechaDesde || fechaHasta) {
        query.fechaValoracion = {};
        if (fechaDesde) {
          (query.fechaValoracion as Record<string, unknown> ).$gte = fechaDesde;
        }
        if (fechaHasta) {
          (query.fechaValoracion as Record<string, unknown> ).$lte = fechaHasta;
        }
      }

      // Obtener todas las valoraciones que coincidan con los filtros
      const valoraciones = await Valoracion.find(query).lean();

      // Calcular estadísticas
      const totalValoraciones = valoraciones.length;
      
      const calificacionPromedio = totalValoraciones > 0 
        ? valoraciones.reduce((sum, val) => sum + val.calificacion, 0) / totalValoraciones
        : 0;

      // Distribución de calificaciones
      const distribucionCalificaciones: { [key: number]: number } = {};
      for (let i = 1; i <= 5; i++) {
        distribucionCalificaciones[i] = valoraciones.filter(v => v.calificacion === i).length;
      }

      // Valoraciones por tipo
      const valoracionesPorTipo = {
        'Nutricionista': valoraciones.filter(v => v.tipoTrabajador === 'Nutricionista').length,
        'Entrenador personal': valoraciones.filter(v => v.tipoTrabajador === 'Entrenador personal').length
      };

      // Valoraciones recientes (últimos 30 días)
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const valoracionesRecientes = valoraciones.filter(
        v => new Date(v.fechaValoracion) >= hace30Dias
      ).length;

      return {
        totalValoraciones,
        calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
        distribucionCalificaciones,
        valoracionesPorTipo,
        valoracionesRecientes
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de valoraciones', { error, filters });
      throw error;
    }
  }

  /**
   * Obtener estadísticas detalladas por tipo de trabajador
   */
  static async getValoracionStatsByTipo(trabajadorId: string): Promise<{
    nutricionista: ValoracionStats;
    entrenador: ValoracionStats;
    general: ValoracionStats;
  }> {
    try {
      const [nutricionistaStats, entrenadorStats, generalStats] = await Promise.all([
        this.getValoracionStats({ trabajadorId, tipoTrabajador: 'Nutricionista' }),
        this.getValoracionStats({ trabajadorId, tipoTrabajador: 'Entrenador personal' }),
        this.getValoracionStats({ trabajadorId })
      ]);

      return {
        nutricionista: nutricionistaStats,
        entrenador: entrenadorStats,
        general: generalStats
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas por tipo', { error, trabajadorId });
      throw error;
    }
  }

  /**
   * Verificar si un cliente puede valorar a un trabajador
   */
  static async canClienteValorarTrabajador(clienteId: string, trabajadorId: string, tipoTrabajador: string) {
    try {
      const trabajador = await User.findById(trabajadorId);
      
      if (!trabajador || trabajador.role !== 'worker') {
        return false;
      }

      const asignacion = trabajador.clientesAsignados?.find(
        (asignacion: { clienteId: mongoose.Types.ObjectId; tipoAsignacion: string }) => 
          asignacion.clienteId.toString() === clienteId &&
          asignacion.tipoAsignacion === tipoTrabajador
      );

      return !!asignacion;
    } catch (error) {
      logger.error('Error al verificar si cliente puede valorar trabajador', { 
        error, 
        clienteId, 
        trabajadorId, 
        tipoTrabajador 
      });
      return false;
    }
  }

  /**
   * Obtener valoraciones de un trabajador específico
   */
  static async getValoracionesByTrabajador(trabajadorId: string, filters: Omit<ValoracionFilters, 'trabajadorId'> = {}) {
    return this.getValoraciones({ ...filters, trabajadorId });
  }

  /**
   * Obtener valoraciones de un cliente específico
   */
  static async getValoracionesByCliente(clienteId: string, filters: Omit<ValoracionFilters, 'clienteId'> = {}) {
    return this.getValoraciones({ ...filters, clienteId });
  }

  /**
   * Obtener tipos de trabajador disponibles para valorar por un cliente
   */
  static async getTiposTrabajadorDisponibles(clienteId: string, trabajadorId: string): Promise<{
    tiposDisponibles: Array<{
      tipo: 'Nutricionista' | 'Entrenador personal';
      puedeValorar: boolean;
      yaValorado: boolean;
      valoracionId?: string;
    }>;
  }> {
    try {
      const User = mongoose.model('User');
      const trabajador = await User.findById(trabajadorId);
      
      if (!trabajador || trabajador.role !== 'worker') {
        throw new Error('Trabajador no encontrado');
      }

      const tiposDisponibles: Array<{
        tipo: 'Nutricionista' | 'Entrenador personal';
        puedeValorar: boolean;
        yaValorado: boolean;
        valoracionId?: string;
      }> = [];

      // Verificar cada tipo de asignación
      for (const asignacion of trabajador.clientesAsignados || []) {
        if (asignacion.clienteId.toString() === clienteId) {
          // Verificar si ya existe una valoración activa para este tipo
          const valoracionExistente = await Valoracion.findOne({
            cliente: clienteId,
            trabajador: trabajadorId,
            tipoTrabajador: asignacion.tipoAsignacion,
            activa: true
          });

          tiposDisponibles.push({
            tipo: asignacion.tipoAsignacion,
            puedeValorar: true,
            yaValorado: !!valoracionExistente,
            valoracionId: valoracionExistente?._id?.toString()
          });
        }
      }

      return { tiposDisponibles };
    } catch (error) {
      logger.error('Error al obtener tipos de trabajador disponibles', { 
        error, 
        clienteId, 
        trabajadorId 
      });
      throw error;
    }
  }
}
