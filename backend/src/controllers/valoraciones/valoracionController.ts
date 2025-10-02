import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ValoracionService } from '../../service/valoraciones/valoracionService';
import { verificarAutenticacion, manejarErrorGenerico, esIdValido } from '../../validators/commonValidators';

export class ValoracionController {
  /**
   * Crear una nueva valoración
   */
  static async createValoracion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clienteId = verificarAutenticacion(req, res, 'crear valoración');
      if (!clienteId) return;

      const { trabajadorId, calificacion, descripcion, tipoTrabajador, fechaValoracion } = req.body;

      // Verificar que el cliente puede valorar al trabajador
      const puedeValorar = await ValoracionService.canClienteValorarTrabajador(
        clienteId,
        trabajadorId,
        tipoTrabajador
      );

      if (!puedeValorar) {
        res.status(403).json({
          message: 'No tienes permisos para valorar a este trabajador'
        });
        return;
      }

      const valoracionData = {
        cliente: clienteId,
        trabajador: trabajadorId,
        calificacion,
        descripcion,
        tipoTrabajador,
        fechaValoracion: fechaValoracion ? new Date(fechaValoracion) : undefined
      };

      const valoracion = await ValoracionService.createValoracion(valoracionData);

      res.status(201).json({
        message: 'Valoración creada exitosamente',
        data: valoracion
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'crear valoración', { body: req.body });
    }
  }

  /**
   * Obtener valoraciones con filtros
   */
  static async getValoraciones(req: Request, res: Response): Promise<void> {
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
        page,
        limit,
        sortBy,
        sortOrder
      } = req.query;

      const filters = {
        trabajadorId: trabajadorId as string,
        clienteId: clienteId as string,
        tipoTrabajador: tipoTrabajador as 'Nutricionista' | 'Entrenador personal',
        calificacionMin: calificacionMin ? parseInt(calificacionMin as string) : undefined,
        calificacionMax: calificacionMax ? parseInt(calificacionMax as string) : undefined,
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
        activa: activa ? activa === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as 'fechaValoracion' | 'calificacion' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await ValoracionService.getValoraciones(filters);

      res.status(200).json({
        message: 'Valoraciones obtenidas exitosamente',
        data: result.valoraciones,
        pagination: result.pagination
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener valoraciones', { query: req.query });
    }
  }

  /**
   * Obtener una valoración por ID
   */
  static async getValoracionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!esIdValido(id)) {
        res.status(400).json({ message: 'ID de valoración inválido' });
        return;
      }

      const valoracion = await ValoracionService.getValoracionById(id);

      res.status(200).json({
        message: 'Valoración obtenida exitosamente',
        data: valoracion
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener valoración', { id: req.params.id });
    }
  }

  /**
   * Actualizar una valoración
   */
  static async updateValoracion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'actualizar valoración');
      if (!userId) return;

      const { id } = req.params;
      const { calificacion, descripcion, activa } = req.body;

      if (!esIdValido(id)) {
        res.status(400).json({ message: 'ID de valoración inválido' });
        return;
      }

      // Verificar que la valoración existe y el usuario tiene permisos
      const valoracionExistente = await ValoracionService.getValoracionById(id);
      
      // Solo el cliente que hizo la valoración puede actualizarla
      if (valoracionExistente.cliente._id.toString() !== userId) {
        res.status(403).json({
          message: 'No tienes permisos para actualizar esta valoración'
        });
        return;
      }

      const updateData = {
        calificacion,
        descripcion,
        activa
      };

      const valoracion = await ValoracionService.updateValoracion(id, updateData);

      res.status(200).json({
        message: 'Valoración actualizada exitosamente',
        data: valoracion
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'actualizar valoración', { 
        id: req.params.id, 
        body: req.body 
      });
    }
  }

  /**
   * Eliminar una valoración (soft delete)
   */
  static async deleteValoracion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'eliminar valoración');
      if (!userId) return;

      const { id } = req.params;

      if (!esIdValido(id)) {
        res.status(400).json({ message: 'ID de valoración inválido' });
        return;
      }

      // Verificar que la valoración existe y el usuario tiene permisos
      const valoracionExistente = await ValoracionService.getValoracionById(id);
      
      // Solo el cliente que hizo la valoración puede eliminarla
      if (valoracionExistente.cliente._id.toString() !== userId) {
        res.status(403).json({
          message: 'No tienes permisos para eliminar esta valoración'
        });
        return;
      }

      const valoracion = await ValoracionService.deleteValoracion(id);

      res.status(200).json({
        message: 'Valoración eliminada exitosamente',
        data: valoracion
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'eliminar valoración', { id: req.params.id });
    }
  }

  /**
   * Obtener estadísticas de valoraciones
   */
  static async getValoracionStats(req: Request, res: Response): Promise<void> {
    try {
      const {
        trabajadorId,
        tipoTrabajador,
        fechaDesde,
        fechaHasta
      } = req.query;

      const filters = {
        trabajadorId: trabajadorId as string,
        tipoTrabajador: tipoTrabajador as 'Nutricionista' | 'Entrenador personal',
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined
      };

      const stats = await ValoracionService.getValoracionStats(filters);

      res.status(200).json({
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener estadísticas', { query: req.query });
    }
  }

  /**
   * Obtener valoraciones de un trabajador específico
   */
  static async getValoracionesByTrabajador(req: Request, res: Response): Promise<void> {
    try {
      const { trabajadorId } = req.params;
      const filters = req.query;

      if (!esIdValido(trabajadorId)) {
        res.status(400).json({ message: 'ID de trabajador inválido' });
        return;
      }

      const result = await ValoracionService.getValoracionesByTrabajador(trabajadorId, {
        tipoTrabajador: filters.tipoTrabajador as 'Nutricionista' | 'Entrenador personal',
        calificacionMin: filters.calificacionMin ? parseInt(filters.calificacionMin as string) : undefined,
        calificacionMax: filters.calificacionMax ? parseInt(filters.calificacionMax as string) : undefined,
        fechaDesde: filters.fechaDesde ? new Date(filters.fechaDesde as string) : undefined,
        fechaHasta: filters.fechaHasta ? new Date(filters.fechaHasta as string) : undefined,
        activa: filters.activa ? filters.activa === 'true' : undefined,
        page: filters.page ? parseInt(filters.page as string) : undefined,
        limit: filters.limit ? parseInt(filters.limit as string) : undefined,
        sortBy: filters.sortBy as 'fechaValoracion' | 'calificacion' | 'createdAt',
        sortOrder: filters.sortOrder as 'asc' | 'desc'
      });

      res.status(200).json({
        message: 'Valoraciones del trabajador obtenidas exitosamente',
        data: result.valoraciones,
        pagination: result.pagination
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener valoraciones del trabajador', { 
        trabajadorId: req.params.trabajadorId,
        query: req.query 
      });
    }
  }

  /**
   * Obtener valoraciones de un cliente específico
   */
  static async getValoracionesByCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = verificarAutenticacion(req, res, 'obtener valoraciones del cliente');
      if (!userId) return;

      const { clienteId } = req.params;
      const filters = req.query;

      // Verificar que el usuario solo puede ver sus propias valoraciones
      if (clienteId !== userId) {
        res.status(403).json({
          message: 'No tienes permisos para ver las valoraciones de otro cliente'
        });
        return;
      }

      if (!esIdValido(clienteId)) {
        res.status(400).json({ message: 'ID de cliente inválido' });
        return;
      }

      const result = await ValoracionService.getValoracionesByCliente(clienteId, {
        tipoTrabajador: filters.tipoTrabajador as 'Nutricionista' | 'Entrenador personal',
        calificacionMin: filters.calificacionMin ? parseInt(filters.calificacionMin as string) : undefined,
        calificacionMax: filters.calificacionMax ? parseInt(filters.calificacionMax as string) : undefined,
        fechaDesde: filters.fechaDesde ? new Date(filters.fechaDesde as string) : undefined,
        fechaHasta: filters.fechaHasta ? new Date(filters.fechaHasta as string) : undefined,
        activa: filters.activa ? filters.activa === 'true' : undefined,
        page: filters.page ? parseInt(filters.page as string) : undefined,
        limit: filters.limit ? parseInt(filters.limit as string) : undefined,
        sortBy: filters.sortBy as 'fechaValoracion' | 'calificacion' | 'createdAt',
        sortOrder: filters.sortOrder as 'asc' | 'desc'
      });

      res.status(200).json({
        message: 'Valoraciones del cliente obtenidas exitosamente',
        data: result.valoraciones,
        pagination: result.pagination
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener valoraciones del cliente', { 
        clienteId: req.params.clienteId,
        query: req.query 
      });
    }
  }

  /**
   * Verificar si un cliente puede valorar a un trabajador
   */
  static async canClienteValorarTrabajador(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clienteId = verificarAutenticacion(req, res, 'verificar si puede valorar');
      if (!clienteId) return;

      const { trabajadorId, tipoTrabajador } = req.query;

      if (!trabajadorId || !tipoTrabajador) {
        res.status(400).json({
          message: 'trabajadorId y tipoTrabajador son requeridos'
        });
        return;
      }

      if (!esIdValido(trabajadorId as string)) {
        res.status(400).json({ message: 'ID de trabajador inválido' });
        return;
      }

      const puedeValorar = await ValoracionService.canClienteValorarTrabajador(
        clienteId,
        trabajadorId as string,
        tipoTrabajador as string
      );

      res.status(200).json({
        message: 'Verificación completada',
        data: { puedeValorar }
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'verificar si puede valorar', { 
        query: req.query 
      });
    }
  }

  /**
   * Obtener tipos de trabajador disponibles para valorar
   */
  static async getTiposTrabajadorDisponibles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clienteId = verificarAutenticacion(req, res, 'obtener tipos disponibles');
      if (!clienteId) return;

      const { trabajadorId } = req.params;

      if (!esIdValido(trabajadorId)) {
        res.status(400).json({ message: 'ID de trabajador inválido' });
        return;
      }

      const result = await ValoracionService.getTiposTrabajadorDisponibles(clienteId, trabajadorId);

      res.status(200).json({
        message: 'Tipos de trabajador disponibles obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener tipos disponibles', { 
        trabajadorId: req.params.trabajadorId 
      });
    }
  }

  /**
   * Obtener estadísticas detalladas por tipo de trabajador
   */
  static async getValoracionStatsByTipo(req: Request, res: Response): Promise<void> {
    try {
      const { trabajadorId } = req.params;

      if (!esIdValido(trabajadorId)) {
        res.status(400).json({ message: 'ID de trabajador inválido' });
        return;
      }

      const stats = await ValoracionService.getValoracionStatsByTipo(trabajadorId);

      res.status(200).json({
        message: 'Estadísticas por tipo obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      manejarErrorGenerico(error, res, 'obtener estadísticas por tipo', { 
        trabajadorId: req.params.trabajadorId 
      });
    }
  }
}
