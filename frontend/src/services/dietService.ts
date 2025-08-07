import axios from 'axios';
import { CrearDietaDTO, ApiDietaResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST;
const API_ENDPOINT = '/api/diets';

// Actualizar la función para usar los tipos específicos
export const crearDieta = async (dietaData: CrearDietaDTO): Promise<ApiDietaResponse> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    const response = await axios.post<ApiDietaResponse>(
      `${API_BASE_URL}${API_ENDPOINT}`, 
      dietaData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al crear la dieta');
    } else {
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};