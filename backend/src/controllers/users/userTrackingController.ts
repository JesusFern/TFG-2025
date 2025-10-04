import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { UserTrackingService } from '../../service/users/userTrackingService';
import path from 'path';

export class UserTrackingController {

  /**
   * Obtener todos los registros de seguimiento del usuario autenticado
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('Obteniendo seguimiento para usuario:', userId);
      
      const trackings = await UserTrackingService.getTrackingByUserId(userId);
      
      console.log('Tracking obtenido exitosamente:', trackings.length, 'registros');
      res.status(200).json({ success: true, data: trackings });
    } catch (error: unknown) {
      console.error('Error obteniendo seguimiento propio:', error);
      const message = (error as { message?: string })?.message || 'Error al obtener seguimiento';
      res.status(500).json({ success: false, message });
    }
  }


  /**
   * Actualizar un registro de seguimiento existente
   */
  static async updateTracking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        pesoCorporal, 
        porcentajeGrasaCorporal,
        porcentajeMasaMuscular, 
        perimetroCintura, 
        perimetroCadera, 
        perimetroPecho, 
        perimetroBrazoIzquierdo, 
        perimetroBrazoDerecho, 
        perimetroMusloIzquierdo, 
        perimetroMusloDerecho 
      } = req.body;

      const tracking = await UserTrackingService.updateTracking(id, {
        pesoCorporal: pesoCorporal !== undefined ? Number(pesoCorporal) : undefined,
        porcentajeGrasaCorporal: porcentajeGrasaCorporal !== undefined ? Number(porcentajeGrasaCorporal) : undefined,
        porcentajeMasaMuscular: porcentajeMasaMuscular !== undefined ? Number(porcentajeMasaMuscular) : undefined,
        perimetroCintura: perimetroCintura !== undefined ? Number(perimetroCintura) : undefined,
        perimetroCadera: perimetroCadera !== undefined ? Number(perimetroCadera) : undefined,
        perimetroPecho: perimetroPecho !== undefined ? Number(perimetroPecho) : undefined,
        perimetroBrazoIzquierdo: perimetroBrazoIzquierdo !== undefined ? Number(perimetroBrazoIzquierdo) : undefined,
        perimetroBrazoDerecho: perimetroBrazoDerecho !== undefined ? Number(perimetroBrazoDerecho) : undefined,
        perimetroMusloIzquierdo: perimetroMusloIzquierdo !== undefined ? Number(perimetroMusloIzquierdo) : undefined,
        perimetroMusloDerecho: perimetroMusloDerecho !== undefined ? Number(perimetroMusloDerecho) : undefined
      });

      res.status(200).json({ success: true, data: tracking });
    } catch (error: unknown) {
      console.error('Error actualizando seguimiento:', error);
      const message = (error as { message?: string })?.message || 'Error al actualizar seguimiento';
      res.status(500).json({ success: false, message });
    }
  }


  /**
   * Obtener seguimiento de un cliente para un trabajador
   */
  static async getByUserIdForWorker(req: AuthenticatedRequest, res: Response) {
    try {
      const workerId = req.user!.id;
      const { userId } = req.params;
      
      const trackings = await UserTrackingService.getTrackingForWorker(workerId, userId);
      res.status(200).json({ success: true, data: trackings });
    } catch (error: unknown) {
      console.error('Error obteniendo seguimiento de cliente:', error);
      const message = (error as { message?: string })?.message || 'Error al obtener seguimiento del cliente';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Guardar seguimiento completo (crear nuevo registro)
   */
  static async guardarSeguimientoCompleto(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { 
        pesoCorporal, 
        porcentajeGrasaCorporal,
        porcentajeMasaMuscular, 
        perimetroCintura, 
        perimetroCadera, 
        perimetroPecho, 
        perimetroBrazoIzquierdo, 
        perimetroBrazoDerecho, 
        perimetroMusloIzquierdo, 
        perimetroMusloDerecho, 
        fechaSeguimiento 
      } = req.body;

      const tracking = await UserTrackingService.createUserTracking(userId, {
        pesoCorporal: pesoCorporal ? Number(pesoCorporal) : undefined,
        porcentajeGrasaCorporal: porcentajeGrasaCorporal ? Number(porcentajeGrasaCorporal) : undefined,
        porcentajeMasaMuscular: porcentajeMasaMuscular ? Number(porcentajeMasaMuscular) : undefined,
        perimetroCintura: perimetroCintura ? Number(perimetroCintura) : undefined,
        perimetroCadera: perimetroCadera ? Number(perimetroCadera) : undefined,
        perimetroPecho: perimetroPecho ? Number(perimetroPecho) : undefined,
        perimetroBrazoIzquierdo: perimetroBrazoIzquierdo ? Number(perimetroBrazoIzquierdo) : undefined,
        perimetroBrazoDerecho: perimetroBrazoDerecho ? Number(perimetroBrazoDerecho) : undefined,
        perimetroMusloIzquierdo: perimetroMusloIzquierdo ? Number(perimetroMusloIzquierdo) : undefined,
        perimetroMusloDerecho: perimetroMusloDerecho ? Number(perimetroMusloDerecho) : undefined,
        fechaSeguimiento: fechaSeguimiento ? new Date(fechaSeguimiento) : undefined
      });

      res.status(201).json({ success: true, data: tracking });
    } catch (error: unknown) {
      console.error('Error guardando seguimiento completo:', error);
      const message = (error as { message?: string })?.message || 'Error al guardar seguimiento';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Subir archivo multimedia a un registro específico
   */
  static async uploadArchivoMultimedia(req: AuthenticatedRequest, res: Response) {
    try {
      const { trackingId } = req.params;
      
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo' });
        return;
      }
      
      // Construir la ruta relativa del archivo incluyendo la subcarpeta UUID
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      const relativePath = path.relative(uploadsPath, req.file.path);
      const archivoPath = relativePath.replace(/\\/g, '/'); // Normalizar separadores para web
      
      const updated = await UserTrackingService.addArchivoMultimedia(trackingId, archivoPath);
      res.status(200).json({ 
        success: true, 
        data: updated, 
        archivo: { 
          path: archivoPath, 
          originalName: req.file.originalname, 
          size: req.file.size, 
          mimetype: req.file.mimetype 
        } 
      });
    } catch (error: unknown) {
      console.error('Error subiendo archivo multimedia:', error);
      const message = (error as { message?: string })?.message || 'Error al subir archivo multimedia';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Eliminar archivo multimedia de un registro específico
   */
  static async removeArchivoMultimedia(req: AuthenticatedRequest, res: Response) {
    try {
      const { trackingId, archivoPath } = req.params;
      const decodedArchivoPath = decodeURIComponent(archivoPath);
      
      const updated = await UserTrackingService.removeArchivoMultimedia(trackingId, decodedArchivoPath);
      res.status(200).json({ success: true, data: updated });
    } catch (error: unknown) {
      console.error('Error eliminando archivo multimedia:', error);
      const message = (error as { message?: string })?.message || 'Error al eliminar archivo multimedia';
      res.status(500).json({ success: false, message });
    }
  }

}