import { apiKey } from '../../config/stream';
import jwt from 'jsonwebtoken';

/**
 * Crear token de usuario para Stream.io
 */
export const createUserTokenService = async (userId: string) => {
  try {
    const apiSecret = process.env.STREAM_API_SECRET;
    if (!apiSecret) {
      throw new Error('STREAM_API_SECRET no está configurado');
    }

    // Generar token JWT para Stream.io
    const payload = {
      iss: apiKey, // Issuer (API Key)
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
      user_id: userId,
      role: 'user'
    };

    const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' });
    
    return {
      token,
      userId,
      expiresAt: new Date(payload.exp * 1000) // Token válido por 24 horas
    };
  } catch (error) {
    console.error('Error en createUserTokenService:', error);
    throw error;
  }
};
