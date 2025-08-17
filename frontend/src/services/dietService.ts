import axios from 'axios';
import { CrearDietaDTO, ApiDietaResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST;
const API_ENDPOINT = '/api/diets';

export const crearDieta = async (dietaData: CrearDietaDTO): Promise<ApiDietaResponse> => {
  //const token = localStorage.getItem('token');
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzUyN2Q2ZDNmNDk1NTEzNzJlOTQ5YSIsInJvbGUiOiJ3b3JrZXIiLCJpYXQiOjE3NTU0NDQ2NzQsImV4cCI6MTc1NTQ0ODI3NH0.2ytKkCC4tjFsqNu9oocD1RdKMiy3cLySRkFChos7F3Q';
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    console.log('Enviando datos al backend:', JSON.stringify(dietaData, null, 2));
    
    const response = await axios.post<ApiDietaResponse>(
      `${API_BASE_URL}${API_ENDPOINT}`, 
      dietaData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      console.error('Mensaje de error:', error.message);
      
      // Mensaje de error más detallado
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al crear la dieta';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};