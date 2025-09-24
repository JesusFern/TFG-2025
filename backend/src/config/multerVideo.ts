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

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir videos
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video'));
  }
};

const uploadVideo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo para videos
    files: 1 // Máximo 1 video por ejercicio
  }
});

export default uploadVideo;
