import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { verificarAutenticacion, manejarErrorGenerico } from '../../validators/commonValidators';
import { IncidentService } from '../../service/incidents/incidentService';
import path from 'path';
import fs from 'fs';

// Crear incidencia - Usuario/Trabajador
export const crearIncidencia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'crear incidencia');
    if (!userId) return;

    const { descripcion } = req.body;

    const incidencia = await IncidentService.crearIncidencia({
      descripcion,
      creadorId: userId
    });

    // Procesar imágenes si existen
    let imagenes: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      const incidentId = incidencia.id;
      
      // Crear directorio específico para esta incidencia
      const incidentUploadDir = path.join(uploadsPath, 'incidencias', incidentId);
      console.log('Directorio de incidencia:', incidentUploadDir);
      if (!fs.existsSync(incidentUploadDir)) {
        fs.mkdirSync(incidentUploadDir, { recursive: true });
      }
      
      imagenes = req.files.map((file: Express.Multer.File) => {
        try {
          const oldPath = file.path;
          const newPath = path.join(incidentUploadDir, path.basename(file.filename));
          
          console.log('Moviendo archivo de:', oldPath, 'a:', newPath);
          
          // Mover el archivo de la carpeta temporal a la carpeta específica de la incidencia
          fs.renameSync(oldPath, newPath);
          
          // Guardar solo el nombre del archivo en la base de datos
          // La ruta completa se construirá en el frontend
          const fileName = path.basename(file.filename);
          console.log('Nombre de archivo a guardar en DB:', fileName);
          return fileName;
        } catch (error) {
          console.error('Error moviendo archivo:', error);
          throw new Error(`Error procesando imagen: ${file.originalname}`);
        }
      });

      // Actualizar la incidencia con las rutas de las imágenes
      console.log('Guardando imágenes en MongoDB:', imagenes);
      await IncidentService.actualizarImagenesIncidencia(incidentId, imagenes);
    }

    res.status(201).json({
      message: 'Incidencia creada exitosamente',
      incidencia: {
        ...incidencia,
        imagenes
      }
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'crear incidencia');
  }
};

// Obtener todas las incidencias - Solo Admin
export const obtenerTodasLasIncidencias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener todas las incidencias');
    if (!userId) return;

    // Verificar que el usuario es admin
    const esAdmin = await IncidentService.verificarEsAdministrador(userId);
    if (!esAdmin) {
      res.status(403).json({ message: 'Solo los administradores pueden ver todas las incidencias' });
      return;
    }

    const incidencias = await IncidentService.obtenerTodasLasIncidencias(userId);

    res.status(200).json({
      message: 'Incidencias obtenidas exitosamente',
      incidencias
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'obtener todas las incidencias');
  }
};

// Marcar incidencia como resuelta - Solo Admin
export const marcarComoResuelta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'marcar incidencia como resuelta');
    if (!userId) return;

    const { id } = req.params;
    const { estado } = req.body;

    const incidencia = await IncidentService.marcarComoResuelta(id, {
      estado,
      administradorId: userId
    });

    res.status(200).json({
      message: 'Incidencia marcada como resuelta exitosamente',
      incidencia
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'marcar incidencia como resuelta');
  }
};

// Obtener mis incidencias - Usuario/Trabajador
export const obtenerMisIncidencias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'obtener mis incidencias');
    if (!userId) return;

    const incidencias = await IncidentService.obtenerIncidenciasPorUsuario(userId);

    res.status(200).json({
      message: 'Incidencias obtenidas exitosamente',
      incidencias
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'obtener mis incidencias');
  }
};

// Eliminar incidencia - Usuario/Trabajador (solo el creador)
export const eliminarIncidencia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'eliminar incidencia');
    if (!userId) return;

    const { id } = req.params;

    await IncidentService.eliminarIncidencia(id, userId);

    res.status(200).json({
      message: 'Incidencia eliminada exitosamente'
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'eliminar incidencia');
  }
};

export const asignarIncidencia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = verificarAutenticacion(req, res, 'asignar incidencia');
    if (!userId) return;

    const { id } = req.params;

    await IncidentService.asignarIncidencia(id, userId);

    res.status(200).json({
      message: 'Incidencia asignada exitosamente'
    });

  } catch (error) {
    manejarErrorGenerico(error, res, 'asignar incidencia');
  }
};
