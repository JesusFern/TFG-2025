import { apiRequest } from './api';

export interface StreamTokenResponse {
  token: string;
  userId: string;
  expiresAt: string;
  message: string;
}

class VideoService {
  /**
   * Obtener token de usuario para Stream.io
   */
  async getUserToken(): Promise<StreamTokenResponse> {
    try {
      const response = await apiRequest('/api/video/token', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener token de video:', error);
      throw new Error('No se pudo obtener el token para videollamadas');
    }
  }
}

export const videoService = new VideoService();
