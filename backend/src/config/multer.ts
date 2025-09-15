import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Función para validar y sanitizar rutas de forma segura
const validateAndSanitizePath = (basePath: string): string => {
  // 1. Asegurar que el directorio base termine con separador
  const normalizedBasePath = path.resolve(basePath) + path.sep;
  
  // 2. Generar un ID seguro en lugar de usar input del usuario
  const safeId = randomUUID();
  
  // 3. Construir la ruta de forma segura
  const targetPath = path.join(normalizedBasePath, 'recipes', safeId);
  
  // 4. Resolver la ruta canónica
  const canonicalPath = path.resolve(targetPath);
  
  // 5. Verificar que la ruta esté dentro del directorio base
  if (!canonicalPath.startsWith(normalizedBasePath)) {
    throw new Error('Ruta de destino fuera del directorio permitido');
  }
  
  return canonicalPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      
      // Usar validación segura de rutas
      const recipePath = validateAndSanitizePath(uploadsPath);
      
      if (!fs.existsSync(recipePath)) {
        fs.mkdirSync(recipePath, { recursive: true });
      }
      
      cb(null, recipePath);
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
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // Máximo 5 imágenes
  }
});

export default upload;
