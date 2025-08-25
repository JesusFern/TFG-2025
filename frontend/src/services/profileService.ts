import { apiRequest } from './api';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica, ProfileFormData } from '../types/profile';

export const profileService = {
  // Obtener perfil del usuario
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiRequest(`/users/${userId}`);
    return response.user;
  },

  // Actualizar perfil del usuario
  async updateProfile(userId: string, data: ProfileFormData): Promise<UserProfile> {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.user;
  },

  // Obtener datos de salud y nutrición
  async getDatosSalud(userId: string): Promise<DatosSaludYNutricion | null> {
    try {
      const response = await apiRequest(`/users/${userId}/datos-salud`);
      return response.datosSalud;
    } catch (error) {
      // Si no hay datos de salud, retornar null
      return null;
    }
  },

  // Obtener datos de actividad física
  async getDatosActividad(userId: string): Promise<DatosActividadFisica | null> {
    try {
      const response = await apiRequest(`/users/${userId}/datos-actividad`);
      return response.datosActividad;
    } catch (error) {
      // Si no hay datos de actividad, retornar null
      return null;
    }
  },

  // Subir foto de perfil
  async uploadProfilePhoto(userId: string, file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiRequest(`/users/${userId}/profile-photo`, {
      method: 'POST',
      body: formData,
      // No incluir Content-Type, se establece automáticamente para FormData
    });
    
    return response;
  },

  // Cambiar contraseña
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiRequest(`/users/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response;
  },

  // Eliminar cuenta
  async deleteAccount(userId: string, password: string): Promise<{ message: string }> {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response;
  }
};
