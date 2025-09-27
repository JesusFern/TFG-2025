import { Ingrediente } from '../types';
import { apiRequest } from './api';

/**
 * Obtiene todos los ingredientes disponibles
 */
export const obtenerIngredientes = async (): Promise<Ingrediente[]> => {
  try {
    const response = await apiRequest('/api/ingredientes', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener los ingredientes');
    }
    
    const data = await response.json();
    return data.ingredientes || [];
  } catch (error) {
    console.error('Error al obtener ingredientes:', error);
    throw error;
  }
};

/**
 * Busca ingredientes por término
 */
export const buscarIngredientes = async (termino: string): Promise<Ingrediente[]> => {
  try {
    const response = await apiRequest(`/api/ingredientes/buscar?q=${encodeURIComponent(termino)}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar ingredientes');
    }
    
    const data = await response.json();
    return data.ingredientes || [];
  } catch (error) {
    console.error('Error al buscar ingredientes:', error);
    throw error;
  }
};

/**
 * Obtiene ingredientes por sus IDs
 */
export const obtenerIngredientesPorIds = async (ids: string[]): Promise<Ingrediente[]> => {
  try {
    if (ids.length === 0) return [];
    
    const response = await apiRequest(`/api/ingredientes/por-ids`, {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener ingredientes por IDs');
    }
    
    const data = await response.json();
    return data.ingredientes || [];
  } catch (error) {
    console.error('Error al obtener ingredientes por IDs:', error);
    throw error;
  }
};

