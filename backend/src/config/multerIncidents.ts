import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadsPath = process.env.UPLOADS_PATH || './uploads';
      const tempIncidentsPath = path.join(uploadsPath, 'tmp', 'incidencias');
      
      if (!fs.existsSync(tempIncidentsPath)) {
        fs.mkdirSync(tempIncidentsPath, { recursive: true });
      }
      
      cb(null, tempIncidentsPath);
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
    fileSize: 5 * 1024 * 1024, // 5MB máximo por imagen
    files: 5 // Máximo 5 imágenes
  }
});

export default upload;
