import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleVideoUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ 
        message: 'El archivo de video es demasiado grande. El tamaño máximo permitido es 50MB.' 
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ 
        message: 'Demasiados archivos. Se permite un máximo de 1 video por ejercicio.' 
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
  
  if (error.message === 'Solo se permiten archivos de video') {
    res.status(400).json({ 
      message: 'Solo se permiten archivos de video (MP4, AVI, MOV, etc.)' 
    });
    return;
  }

  next(error);
};
