import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configuración para diferentes tipos de upload
const uploadConfigs = {
  image: {
    maxSize: '5MB',
    maxFiles: 5,
    fileType: 'imagen',
    allowedTypes: 'JPG, PNG, GIF, etc.'
  },
  video: {
    maxSize: '50MB',
    maxFiles: 1,
    fileType: 'video',
    allowedTypes: 'MP4, AVI, MOV, etc.'
  }
};

// Middleware genérico para manejo de errores de upload
export const createUploadErrorHandler = (type: 'image' | 'video') => {
  const config = uploadConfigs[type];
  
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ 
          message: `El archivo de ${config.fileType} es demasiado grande. El tamaño máximo permitido es ${config.maxSize}.` 
        });
        return;
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({ 
          message: `Demasiados archivos. Se permite un máximo de ${config.maxFiles} ${config.fileType}${config.maxFiles > 1 ? 's' : ''}.` 
        });
        return;
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ 
          message: 'Campo de archivo inesperado.' 
        });
        return;
      }
    }
    
    // Capturar errores de fileFilter
    if (error.message.includes('Solo se permiten archivos de video')) {
      res.status(400).json({ 
        message: error.message
      });
      return;
    }
    
    if (error.message === `Solo se permiten archivos de ${config.fileType}`) {
      res.status(400).json({ 
        message: `Solo se permiten archivos de ${config.fileType} (${config.allowedTypes})` 
      });
      return;
    }

    // Para otros errores de Multer o errores personalizados, enviar el mensaje tal cual
    if (error.message) {
      res.status(400).json({ 
        message: error.message
      });
      return;
    }

    next(error);
  };
};

// Función de conveniencia para mantener compatibilidad con código existente
export const handleUploadError = createUploadErrorHandler('image');
