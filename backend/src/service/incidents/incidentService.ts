import mongoose from 'mongoose';
import Incidencia from '../../models/incidents/incidencia';
import User from '../../models/users/user';
import logger from '../../utils/logger';
import { CrearIncidenciaData, ResolverIncidenciaData, IncidenciaResponse } from '../../types/incidentTypes';

export class IncidentService {
  /**
   * Crear una nueva incidencia
   */
  static async crearIncidencia(data: CrearIncidenciaData): Promise<IncidenciaResponse> {
    const { descripcion, creadorId } = data;

    // Verificar que el usuario existe y obtener sus datos
    const usuario = await User.findById(creadorId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el usuario no sea admin (solo users y workers pueden crear incidencias)
    if (usuario.role === 'admin') {
      throw new Error('Los administradores no pueden crear incidencias');
    }

    // Crear la incidencia
    const incidencia = new Incidencia({
      creadorId,
      descripcion,
      estado: 'Por resolver'
    });

    await incidencia.save();

    logger.info('Incidencia creada exitosamente', {
      incidenciaId: incidencia._id,
      creadorId: creadorId,
      creadorRole: usuario.role
    });

    return this.mapIncidenciaToResponse(incidencia);
  }

  /**
   * Obtener todas las incidencias del sistema (solo para administradores)
   * Filtro: Incidencias no asignadas o asignadas al admin actual (cualquier estado)
   * Orden: Primero las no asignadas, luego las asignadas
   */
  static async obtenerTodasLasIncidencias(adminId?: string): Promise<IncidenciaResponse[]> {
    // Construir el filtro: incidencias no asignadas o asignadas al admin actual
    const filter = {
      $or: [
        // Incidencias no asignadas (sin administradorAsignado)
        { administradorAsignado: { $exists: false } },
        { administradorAsignado: null },
        // Incidencias asignadas al admin actual (cualquier estado)
        {
          administradorAsignado: adminId
        }
      ]
    };

    // Obtener incidencias con el filtro aplicado, incluyendo información del creador y admin asignado
    const incidencias = await Incidencia.find(filter)
      .populate('creadorId', 'fullName email role workerType')
      .populate('administradorAsignado', 'fullName email')
      .sort({
        // Primero las no asignadas (administradorAsignado null o no existe)
        administradorAsignado: 1,
        // Luego por fecha de creación (más recientes primero)
        createdAt: -1
      })
      .lean();

    logger.info('Incidencias obtenidas por administrador', {
      adminId,
      totalIncidencias: incidencias.length,
      filtro: 'No asignadas y asignadas al admin (cualquier estado)'
    });

    return incidencias.map(incidencia => this.mapIncidenciaToResponse(incidencia));
  }

  /**
   * Obtener las incidencias de un usuario/trabajador específico
   */
  static async obtenerIncidenciasPorUsuario(usuarioId: string): Promise<IncidenciaResponse[]> {
    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener las incidencias del usuario/trabajador ordenadas por fecha de creación
    const incidencias = await Incidencia.find({ creadorId: usuarioId })
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Incidencias obtenidas por usuario', {
      userId: usuarioId,
      userRole: usuario.role,
      totalIncidencias: incidencias.length
    });

    return incidencias.map(incidencia => this.mapIncidenciaToResponse(incidencia));
  }

  /**
   * Marcar una incidencia como resuelta (solo administradores)
   */
  static async marcarComoResuelta(
    incidenciaId: string, 
    data: ResolverIncidenciaData
  ): Promise<IncidenciaResponse> {
    const { estado, administradorId } = data;

    // Verificar que el ID es válido
    if (!mongoose.Types.ObjectId.isValid(incidenciaId)) {
      throw new Error('ID de incidencia no válido');
    }

    // Verificar que el administrador existe y es admin
    const administrador = await User.findById(administradorId);
    if (!administrador || administrador.role !== 'admin') {
      throw new Error('Solo los administradores pueden marcar incidencias como resueltas');
    }

    // Buscar la incidencia
    const incidencia = await Incidencia.findById(incidenciaId);
    if (!incidencia) {
      throw new Error('Incidencia no encontrada');
    }

    // Actualizar la incidencia
    const incidenciaActualizada = await Incidencia.findByIdAndUpdate(
      incidenciaId,
      {
        estado,
        administradorAsignado: administradorId
      },
      { new: true, runValidators: true }
    );

    if (!incidenciaActualizada) {
      throw new Error('Error al actualizar la incidencia');
    }

    logger.info('Incidencia marcada como resuelta por administrador', {
      incidenciaId: incidenciaId,
      adminId: administradorId,
      nuevoEstado: estado
    });

    return this.mapIncidenciaToResponse(incidenciaActualizada);
  }

  /**
   * Obtener una incidencia por ID
   */
  static async obtenerIncidenciaPorId(incidenciaId: string): Promise<IncidenciaResponse> {
    // Verificar que el ID es válido
    if (!mongoose.Types.ObjectId.isValid(incidenciaId)) {
      throw new Error('ID de incidencia no válido');
    }

    const incidencia = await Incidencia.findById(incidenciaId);
    if (!incidencia) {
      throw new Error('Incidencia no encontrada');
    }

    return this.mapIncidenciaToResponse(incidencia);
  }

  /**
   * Verificar si un usuario puede crear incidencias
   */
  static async verificarPermisosCreacion(usuarioId: string): Promise<boolean> {
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return false;
    }

    // Solo users y workers pueden crear incidencias
    return usuario.role === 'user' || usuario.role === 'worker';
  }

  /**
   * Verificar si un usuario es administrador
   */
  static async verificarEsAdministrador(usuarioId: string): Promise<boolean> {
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return false;
    }

    return usuario.role === 'admin';
  }

  /**
   * Actualizar imágenes de una incidencia
   */
  static async actualizarImagenesIncidencia(incidenciaId: string, imagenes: string[]): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(incidenciaId)) {
      throw new Error('ID de incidencia no válido');
    }

    await Incidencia.findByIdAndUpdate(
      incidenciaId,
      { imagenes },
      { new: true, runValidators: true }
    );
  }

  /**
   * Eliminar una incidencia (solo el creador puede eliminarla)
   */
  static async eliminarIncidencia(incidenciaId: string, usuarioId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(incidenciaId)) {
      throw new Error('ID de incidencia no válido');
    }

    // Buscar la incidencia y verificar que el usuario es el creador
    const incidencia = await Incidencia.findById(incidenciaId);
    if (!incidencia) {
      throw new Error('Incidencia no encontrada');
    }

    if (incidencia.creadorId.toString() !== usuarioId) {
      throw new Error('No tienes permisos para eliminar esta incidencia');
    }

    // Solo se pueden eliminar incidencias que no estén resueltas
    if (incidencia.estado === 'Resuelta') {
      throw new Error('No se pueden eliminar incidencias ya resueltas');
    }

    // Eliminar la incidencia
    await Incidencia.findByIdAndDelete(incidenciaId);
  }

  static async asignarIncidencia(incidenciaId: string, administradorId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(incidenciaId)) {
      throw new Error('ID de incidencia no válido');
    }

    if (!mongoose.Types.ObjectId.isValid(administradorId)) {
      throw new Error('ID de administrador no válido');
    }

    // Buscar la incidencia
    const incidencia = await Incidencia.findById(incidenciaId);
    if (!incidencia) {
      throw new Error('Incidencia no encontrada');
    }

    // Verificar que la incidencia esté en estado "Por resolver"
    if (incidencia.estado !== 'Por resolver') {
      throw new Error('Solo se pueden asignar incidencias que estén por resolver');
    }

    // Asignar la incidencia al administrador y cambiar el estado
    incidencia.administradorAsignado = new mongoose.Types.ObjectId(administradorId);
    incidencia.estado = 'En proceso de resolución';
    
    await incidencia.save();
  }

  /**
   * Mapear una incidencia de MongoDB a formato de respuesta
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapIncidenciaToResponse(incidencia: any): IncidenciaResponse {
    return {
      id: incidencia._id.toString(),
      descripcion: incidencia.descripcion,
      estado: incidencia.estado,
      creadorId: incidencia.creadorId.toString(),
      administradorAsignado: incidencia.administradorAsignado?.toString(),
      imagenes: incidencia.imagenes || [],
      fechaResolucion: incidencia.fechaResolucion,
      createdAt: incidencia.createdAt,
      updatedAt: incidencia.updatedAt,
      // Información del creador (si está poblada)
      creador: incidencia.creadorId && typeof incidencia.creadorId === 'object' ? {
        fullName: incidencia.creadorId.fullName,
        email: incidencia.creadorId.email,
        role: incidencia.creadorId.role,
        workerType: incidencia.creadorId.workerType
      } : undefined,
      // Información del administrador asignado (si está poblada)
      administrador: incidencia.administradorAsignado && typeof incidencia.administradorAsignado === 'object' ? {
        fullName: incidencia.administradorAsignado.fullName,
        email: incidencia.administradorAsignado.email
      } : undefined
    };
  }
}

