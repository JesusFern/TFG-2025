import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ 
        message: 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.' 
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ 
        message: 'Demasiados archivos. Se permite un máximo de 5 imágenes.' 
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
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    res.status(400).json({ 
      message: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)' 
    });
    return;
  }

  next(error);
};
