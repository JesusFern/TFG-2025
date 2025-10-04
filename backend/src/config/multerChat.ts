import multer from 'multer';
import { createMulterStorage} from './multerCommon';

// Filtro de archivos para chat (permite más tipos de archivos)
const chatFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Imágenes
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/3gp',
    'video/quicktime',
    
    // Audio
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mpeg',
    'audio/aac',
    'audio/flac',
    
    // Documentos
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'application/rtf',
    
    // Archivos comprimidos
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido para chat'));
  }
};

// Configuración específica para archivos de chat
const chatLimits = {
  fileSize: 50 * 1024 * 1024, // 50MB máximo por archivo (aumentado para videos)
  files: 5 // Máximo 5 archivos por mensaje
};

const upload = multer({
  storage: createMulterStorage('chat'),
  fileFilter: chatFileFilter,
  limits: chatLimits
});

export default upload;
