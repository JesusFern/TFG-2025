import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

const API_URL = '/api';

export interface ClienteAsignado {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  birthDate?: string;
  tipoAsignacion?: 'Nutricionista' | 'Entrenador personal';
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

export interface ClientesResponse {
  message: string;
  clientes: ClienteAsignado[];
}

export const getClientesAsignados = async (): Promise<ClientesResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<ClientesResponse>(`${API_URL}/workers/clients`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener clientes asignados');
    }
    throw new Error('Error de conexión al servidor');
  }
};
