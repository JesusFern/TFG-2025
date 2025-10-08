import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import fs from 'fs';
import { 
  crearRegistroEjercicioService,
  obtenerRegistrosEjercicioService,
  obtenerRegistroEjercicioPorIdService,
  actualizarRegistroEjercicioService,
  eliminarRegistroEjercicioService,
  marcarRegistroCompletadoService,
  obtenerProgresoEjercicioService,
  verificarSesionCompletaService
} from '../../service/training/registroEjercicioService';
import logger from '../../utils/logger';
import { matchedData } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

export const crearRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const {
      ejercicio,
      sesion,
      cargaUtilizada,
      repeticionesRealizadas,
      seriesCompletadas,
      nivelEsfuerzo,
      videoCliente,
      notas,
      tiempoDescanso,
      duracionEjercicio,
      ordenEnSesion,
      completado
    } = matchedData(req, { locations: ['body'], includeOptionals: true }) as {
      ejercicio: string;
      sesion: string;
      cargaUtilizada?: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      videoCliente?: string;
      notas?: string;
      tiempoDescanso?: number;
      duracionEjercicio?: number;
      ordenEnSesion?: number;
      completado?: boolean;
    };

    logger.debug('Procesando datos para crear registro de ejercicio', {
      clienteId,
      ejercicio,
      sesion,
      nivelEsfuerzo
    });

    const registro = await crearRegistroEjercicioService({
      ejercicioId: ejercicio,
      sesionId: sesion,
      clienteId,
      cargaUtilizada,
      repeticionesRealizadas,
      seriesCompletadas,
      nivelEsfuerzo,
      videoCliente,
      notas,
      tiempoDescanso,
      duracionEjercicio,
      ordenEnSesion,
      completado
    });

    logger.info('Registro de ejercicio creado correctamente', { registroId: registro._id });
    res.status(201).json({ message: 'Registro de ejercicio creado correctamente', registro });
  } catch (error) {
    logger.error('Error al crear registro de ejercicio', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ message: 'Error al crear registro de ejercicio', error: (error as Error).message });
  }
};

export const obtenerRegistrosEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const filtros = matchedData(req, { locations: ['query'], includeOptionals: true }) as {
      sesion?: string;
      cliente?: string;
      ejercicio?: string;
      completado?: boolean;
      fecha?: string;
      fechaDesde?: string;
      fechaHasta?: string;
    };

    // Si no se especifica cliente, usar el cliente autenticado
    if (!filtros.cliente) {
      filtros.cliente = clienteId;
    }

    // Verificar que el cliente solo puede ver sus propios registros
    if (filtros.cliente !== clienteId) {
      res.status(403).json({ message: 'No tienes permisos para ver registros de otros clientes' });
      return;
    }

    const registros = await obtenerRegistrosEjercicioService(filtros);

    logger.info('Registros de ejercicio obtenidos correctamente', { 
      clienteId, 
      cantidad: registros.length 
    });
    res.status(200).json({ registros });
  } catch (error) {
    logger.error('Error al obtener registros de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener registros de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerRegistroEjercicioPorId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const registro = await obtenerRegistroEjercicioPorIdService(id);

    // Verificar que el cliente solo puede ver sus propios registros
    if (registro.cliente._id.toString() !== clienteId) {
      res.status(403).json({ message: 'No tienes permisos para ver este registro' });
      return;
    }

    logger.info('Registro de ejercicio obtenido correctamente', { registroId: id });
    res.status(200).json({ registro });
  } catch (error) {
    logger.error('Error al obtener registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(404).json({
      message: 'Error al obtener registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const actualizarRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;
    const datosActualizacion = matchedData(req, { locations: ['body'], includeOptionals: true }) as Partial<{
      cargaUtilizada: number;
      repeticionesRealizadas: number;
      seriesCompletadas: number;
      nivelEsfuerzo: number;
      videoCliente: string;
      notas: string;
      tiempoDescanso: number;
      duracionEjercicio: number;
      completado: boolean;
    }>;

    logger.debug('Procesando datos para actualizar registro de ejercicio', {
      clienteId,
      registroId: id,
      datosActualizacion
    });

    const registro = await actualizarRegistroEjercicioService(id, clienteId, datosActualizacion);

    logger.info('Registro de ejercicio actualizado correctamente', { registroId: id });
    res.status(200).json({ message: 'Registro de ejercicio actualizado correctamente', registro });
  } catch (error) {
    logger.error('Error al actualizar registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al actualizar registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const eliminarRegistroEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const resultado = await eliminarRegistroEjercicioService(id, clienteId);

    logger.info('Registro de ejercicio eliminado correctamente', { registroId: id });
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Error al eliminar registro de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al eliminar registro de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const marcarRegistroCompletado = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { id } = req.params;

    const registro = await marcarRegistroCompletadoService(id, clienteId);

    logger.info('Registro de ejercicio marcado como completado', { registroId: id });
    res.status(200).json({ message: 'Registro marcado como completado correctamente', registro });
  } catch (error) {
    logger.error('Error al marcar registro como completado', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al marcar registro como completado',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const obtenerProgresoEjercicio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { ejercicioId, fechaDesde, fechaHasta } = matchedData(req, { 
      locations: ['params', 'query'], 
      includeOptionals: true 
    }) as {
      ejercicioId: string;
      fechaDesde?: string;
      fechaHasta?: string;
    };

    const progreso = await obtenerProgresoEjercicioService(
      ejercicioId, 
      clienteId, 
      fechaDesde, 
      fechaHasta
    );

    logger.info('Progreso de ejercicio obtenido correctamente', { 
      ejercicioId, 
      clienteId,
      cantidad: progreso.length 
    });
    res.status(200).json({ progreso });
  } catch (error) {
    logger.error('Error al obtener progreso de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al obtener progreso de ejercicio',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const verificarSesionCompleta = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { sesionId } = req.params;

    const verificacion = await verificarSesionCompletaService(sesionId, clienteId);

    logger.info('Verificación de sesión completada', { 
      sesionId, 
      clienteId,
      sesionCompleta: verificacion.sesionCompleta 
    });
    res.status(200).json(verificacion);
  } catch (error) {
    logger.error('Error al verificar sesión completa', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(400).json({
      message: 'Error al verificar sesión completa',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Configuración de multer para videos de ejercicios
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/ejercicios');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const subcarpeta = randomUUID();
    const filename = `${subcarpeta}/${Date.now()}-${file.originalname}`;
    
    // Crear la subcarpeta si no existe
    const subcarpetaPath = path.join(__dirname, '../../../uploads/ejercicios', subcarpeta);
    if (!fs.existsSync(subcarpetaPath)) {
      fs.mkdirSync(subcarpetaPath, { recursive: true });
    }
    
    cb(null, filename);
  }
});

const fileFilter = (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Lista de tipos MIME permitidos para videos
  const allowedMimeTypes = [
    'video/mp4',
    'video/avi',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-quicktime',
    'video/mov',
    'video/webm'
  ];
  
  // Verificar si el tipo MIME está en la lista de permitidos
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error(`Solo se permiten archivos de video (MP4, AVI, MOV, WebM). Tipo recibido: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  }
});

export const uploadVideoEjercicio = [
  upload.single('video'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se proporcionó ningún archivo de video' });
      return;
    }

    const clienteId = req.user?.id;
    if (!clienteId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    // Construir la URL del video (incluyendo la URL base del servidor)
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const videoUrl = `${baseUrl}/uploads/ejercicios/${req.file.filename}`;

    logger.info('Video de ejercicio subido correctamente', {
      clienteId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

    res.status(200).json({
      message: 'Video subido correctamente',
      videoUrl
    });
  } catch (error) {
    logger.error('Error al subir video de ejercicio', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({
      message: 'Error al subir el video',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
  }
];
