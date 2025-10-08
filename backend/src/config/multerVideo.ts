import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Función para validar y sanitizar rutas de forma segura para videos
const validateAndSanitizeVideoPath = (basePath: string): string => {
  // 1. Asegurar que el directorio base termine con separador
  const normalizedBasePath = path.resolve(basePath) + path.sep;
  
  // 2. Construir la ruta de videos de forma segura
  const targetPath = path.join(normalizedBasePath, 'videos');
  
  // 3. Resolver la ruta canónica
  const canonicalPath = path.resolve(targetPath);
  
  // 4. Verificar que la ruta esté dentro del directorio base
  if (!canonicalPath.startsWith(normalizedBasePath)) {
    throw new Error('Ruta de destino fuera del directorio permitido');
  }
  
  return canonicalPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      
      // Usar validación segura de rutas para videos
      const videoPath = validateAndSanitizeVideoPath(uploadsPath);
      
      if (!fs.existsSync(videoPath)) {
        fs.mkdirSync(videoPath, { recursive: true });
      }
      
      cb(null, videoPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre de archivo seguro
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const videoFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo para videos
    files: 1 // Máximo 1 video por ejercicio
  }
});

export default uploadVideo;
