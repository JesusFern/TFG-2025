import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { imageFileFilter, commonLimits } from './multerCommon';

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

const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: commonLimits
});

export default upload;
