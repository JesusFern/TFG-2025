import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { createUserTokenService } from '../../service/video/videoService';

// Crear un token de usuario para Stream.io
export const createUserToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await createUserTokenService(userId);
    
    res.json({ 
      message: 'Token generado exitosamente',
      token: result.token,
      userId: result.userId,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    console.error('Error al generar token:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};