import multer from 'multer';
import { createMulterStorage } from './multerCommon';

// Filtro de archivos para multimedia (imágenes y videos)
const multimediaFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  
  // Permitir videos
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
    return;
  }
  
  cb(new Error('Solo se permiten archivos de imagen y video'));
};

// Límites específicos para user tracking
const userTrackingLimits = {
  fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo (videos pueden ser más grandes)
  files: 3 // Máximo 3 archivos por seguimiento
};

const upload = multer({
  storage: createMulterStorage('userTracking'),
  fileFilter: multimediaFileFilter,
  limits: userTrackingLimits
});

export default upload;
