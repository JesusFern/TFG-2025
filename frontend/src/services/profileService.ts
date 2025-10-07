import { apiRequest } from './api';
import { UserProfile, DatosSaludYNutricion, DatosActividadFisica, ProfileFormData } from '../types/profile';

export const profileService = {
  // Obtener perfil del usuario
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiRequest(`/users/${userId}`);
    const data = await response.json();
    return data.user;
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
    const responseData = await response.json();
    return responseData.user;
  },

  // Obtener datos de salud y nutrición
  async getDatosSalud(userId: string): Promise<DatosSaludYNutricion | null> {
    try {
      const response = await apiRequest(`/users/${userId}/datos-salud`);
      const data = await response.json();
      return data.datosSalud;
    } catch {
      // Si no hay datos de salud, retornar null
      return null;
    }
  },

  // Obtener datos de actividad física
  async getDatosActividad(userId: string): Promise<DatosActividadFisica | null> {
    try {
      const response = await apiRequest(`/users/${userId}/datos-actividad`);
      const data = await response.json();
      return data.datosActividad;
    } catch {
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
    
    const data = await response.json();
    return data;
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
    
    const data = await response.json();
    return data;
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
    
    const data = await response.json();
    return data;
  },

  // Actualizar datos de salud
  async updateHealthData(data: {
    altura: number;
    pesoActual: number;
    objetivoPeso: number;
    condicionesMedicas: string[];
    restriccionesDieteticas: string[];
    alergiasIntolerancias: string[];
    medicacionActual: string[];
    preferenciasAlimentarias: string[];
    horariosComidas: Array<{ comida: string; hora: string; }>;
  }): Promise<{ message: string; datosSalud: DatosSaludYNutricion }> {
    const response = await apiRequest('/api/users/me/health-data', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar datos de salud');
    }
    
    return await response.json();
  },

  // Actualizar datos de actividad física
  async updateActivityData(data: {
    frecuenciaEjercicio: string;
    tipoEjercicioPractica: string[];
    objetivosPrincipales: string[];
    preferenciasEjercicios: string[];
    limitacionesFisicas: string[];
  }): Promise<{ message: string; datosActividad: DatosActividadFisica }> {
    const response = await apiRequest('/api/users/me/activity-data', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar datos de actividad');
    }
    
    return await response.json();
  }
};
