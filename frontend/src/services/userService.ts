import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

const API_URL = '/api';

export interface UserDetailResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  birthDate?: string;
  datosSaludYNutricion?: {
    peso?: number;
    altura?: number;
    imc?: number;
    objetivosNutricionales?: string[];
    alergias?: string[];
    restriccionesDieteticas?: string[];
  };
  datosActividadFisica?: {
    nivelActividad?: string;
    tipoEjercicio?: string[];
    frecuenciaEjercicio?: string;
  };
}

export const getUserById = async (userId: string): Promise<UserDetailResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<UserDetailResponse>(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener datos del usuario');
    }
    throw new Error('Error de conexión al servidor');
  }
};
