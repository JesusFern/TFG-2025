import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import path from 'path';

// Subir archivos de chat
export const subirArchivoChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No se proporcionó ningún archivo' });
      return;
    }

    // Construir URL del archivo subido (incluyendo la subcarpeta UUID)
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const subcarpeta = path.basename(path.dirname(req.file.path));
    const fileUrl = `${baseUrl}/uploads/chat/${subcarpeta}/${req.file.filename}`;

    res.json({
      message: 'Archivo subido exitosamente',
      archivo: {
        nombre: req.file.originalname,
        url: fileUrl,
        tipo: req.file.mimetype,
        tamano: req.file.size,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error al subir archivo de chat:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Subir múltiples archivos de chat
export const subirArchivosChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ message: 'No se proporcionaron archivos' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const archivos = files.map(file => {
      const subcarpeta = path.basename(path.dirname(file.path));
      return {
        nombre: file.originalname,
        url: `${baseUrl}/uploads/chat/${subcarpeta}/${file.filename}`,
        tipo: file.mimetype,
        tamano: file.size,
        filename: file.filename
      };
    });

    res.json({
      message: 'Archivos subidos exitosamente',
      archivos
    });
  } catch (error) {
    console.error('Error al subir archivos de chat:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
