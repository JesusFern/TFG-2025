import { apiRequest } from './api';

export interface VideoUploadResponse {
  videoUrl: string;
  message: string;
}

export const ejercicioVideoService = {
  // Subir video de ejercicio
  async uploadVideo(file: File): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', file);

            const response = await apiRequest('/api/training/registros/upload-video', {
      method: 'POST',
      body: formData,
      // No incluir Content-Type, se establece automáticamente para FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir el video');
    }

    return await response.json();
  }
};
