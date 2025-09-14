import { Plato } from '../types';
import { apiRequest } from './api';

// Función auxiliar para formatear platos para el backend
const formatearPlatoParaBackend = (plato: Plato) => {
  const platoFormateado: {
    _id?: string;
    dietaId?: string;
    diaIndex?: number;
    comidaIndex?: number;
    nombre: string;
    orden: number;
    receta?: string | null;
  } = {
    nombre: plato.nombre || '',
    orden: plato.orden
  };
  
  if (plato._id || plato.idPlato) {
    platoFormateado._id = plato._id || plato.idPlato;
  }
  
  if (plato.dietaId) {
    platoFormateado.dietaId = plato.dietaId;
  }
  
  if (typeof plato.diaIndex === 'number') {
    platoFormateado.diaIndex = plato.diaIndex;
  }
  
  if (typeof plato.comidaIndex === 'number') {
    platoFormateado.comidaIndex = plato.comidaIndex;
  }
  
  if (plato.receta) {
    platoFormateado.receta = plato.receta;
  }
  
  return platoFormateado;
};

/**
 * Actualiza múltiples platos en el backend
 */
export const actualizarPlatos = async (platos: Plato[]): Promise<Plato[]> => {
  try {
    const platosFormateados = platos.map(formatearPlatoParaBackend);
    
    console.log('Enviando platos para actualizar:', platosFormateados);
    console.log('Datos exactos enviados al servidor:', JSON.stringify({ platos: platosFormateados }, null, 2));
    
    const response = await apiRequest('/api/diets/platos', {
      method: 'PUT',
      body: JSON.stringify({ platos: platosFormateados })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar los platos');
    }
    
    const data = await response.json();
    console.log('Respuesta de actualización de platos:', data);
    return data.platos || [];
  } catch (error) {
    console.error('Error al actualizar platos:', error);
    throw error;
  }
};

/**
 * Crea un nuevo plato en el backend
 */
export const crearPlato = async (dietaId: string, diaIndex: number, comidaIndex: number, plato: Plato): Promise<Plato> => {
  try {
    const platoConContexto = {
      ...plato,
      dietaId,
      diaIndex,
      comidaIndex
    };
    
    console.log('Plato con contexto antes de formatear:', platoConContexto);
    
    const platoFormateado = formatearPlatoParaBackend(platoConContexto);
    
    console.log('Enviando plato para crear:', platoFormateado);
    console.log('Datos que se envían al servidor:', JSON.stringify({ plato: platoFormateado }, null, 2));
    
    const response = await apiRequest('/api/diets/platos', {
      method: 'POST',
      body: JSON.stringify({ plato: platoFormateado })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el plato');
    }
    
    const data = await response.json();
    console.log('Respuesta de creación de plato:', data);
    return data.plato || plato;
  } catch (error) {
    console.error('Error al crear plato:', error);
    throw error;
  }
};

/**
 * Elimina un plato del backend
 */
export const eliminarPlato = async (platoId: string): Promise<{ message: string; plato: Plato; diaIndex: number; comidaIndex: number }> => {
  try {
    console.log(`Eliminando plato con ID: ${platoId}`);
    
    const response = await apiRequest(`/api/diets/platos/${platoId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar el plato');
    }
    
    const data = await response.json();
    console.log('Respuesta de eliminación de plato:', data);
    return data;
  } catch (error) {
    console.error('Error al eliminar plato:', error);
    throw error;
  }
};
