import { DietaResponse } from '../types/diets';
import { CrearDietaDTO, ApiDietaResponse, Receta, Dieta, DietaActualizacionDTO, DiaDieta } from '../types';
import { apiRequest } from './api';

export const crearDieta = async (dietaData: CrearDietaDTO): Promise<ApiDietaResponse> => {
  try {
    console.log('Enviando datos al backend:', JSON.stringify(dietaData, null, 2));
    
    const response = await apiRequest('/api/diets', {
      method: 'POST',
      body: JSON.stringify(dietaData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la dieta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al crear la dieta:', error);
    throw error;
  }
};

export const obtenerDieta = async (dietaId: string): Promise<Dieta> => {
  // Validar formato de ObjectId antes de hacer la petición
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(dietaId)) {
    throw new Error('El ID de dieta proporcionado no es válido');
  }
  
  try {
    const response = await apiRequest(`/api/diets/${dietaId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontró la dieta con el ID proporcionado');
      } else if (response.status === 403 || response.status === 401) {
        throw new Error('No tienes permiso para acceder a esta dieta');
      } else {
        const errorData = await response.json();
        throw new Error(`Error al obtener la dieta: ${errorData.message || 'Error desconocido'}`);
      }
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    
    if (!data || !data.dieta) {
      console.error('Estructura de respuesta inesperada:', data);
      throw new Error('La respuesta del servidor no contiene los datos esperados');
    }
    
    return data.dieta;
  } catch (error) {
    console.error('Error al obtener la dieta:', error);
    throw error;
  }
};

export const actualizarDieta = async (dietaId: string, actualizacion: DietaActualizacionDTO): Promise<Dieta> => {
  try {
    console.log('Actualizando dieta con ID:', dietaId);
    console.log('Datos de actualización:', actualizacion);
    
    const response = await apiRequest(`/api/diets/${dietaId}`, {
      method: 'PATCH',
      body: JSON.stringify(actualizacion)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la dieta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data.dieta;
  } catch (error) {
    console.error('Error al actualizar la dieta:', error);
    throw error;
  }
};

export const buscarRecetas = async (termino: string): Promise<Receta[]> => {
  try {
    const response = await apiRequest(`/api/recetas/buscar?q=${encodeURIComponent(termino)}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.error('Error al buscar recetas:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.recetas || [];
  } catch (error) {
    console.error('Error en buscarRecetas:', error);
    return [];
  }
};

export const actualizarDiaDieta = async (
  dietaId: string, 
  diaIndex: number, 
  datosDia: Partial<DiaDieta>
): Promise<DiaDieta> => {
  try {
    console.log(`Actualizando día ${diaIndex} de la dieta ${dietaId}`);
    console.log('Datos de actualización:', datosDia);
    
    const datosFormateados = {
      caloriasTotales: datosDia.caloriasTotales,
      proteinas: datosDia.proteinas,
      hidratosCarbono: datosDia.hidratosCarbono,
      grasas: datosDia.grasas,
      numeroComidas: datosDia.numeroComidas,
      cumplimiento: datosDia.cumplimiento,
      comidas: datosDia.comidas ? datosDia.comidas.map(comida => ({
        horaEstimada: comida.horaEstimada,
        nombreComida: comida.nombreComida
      })) : undefined
    };
    
    const response = await apiRequest(`/api/diets/${dietaId}/dias/${diaIndex}`, {
      method: 'PATCH',
      body: JSON.stringify(datosFormateados)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el día');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data.dia;
  } catch (error) {
    console.error('Error al actualizar el día:', error);
    throw error;
  }
};

export const publicarDieta = async (dietaId: string): Promise<{ dieta: Dieta; platosEliminados: number }> => {
  try {
    console.log(`Publicando dieta con ID: ${dietaId}`);
    
    const response = await apiRequest(`/api/diets/${dietaId}/publicar`, {
      method: 'PATCH',
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al publicar la dieta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor (publicar dieta):', data);
    
    // Retornar tanto la dieta como el número de platos eliminados
    return {
      dieta: data.dieta,
      platosEliminados: data.platosEliminados || 0
    };
  } catch (error) {
    console.error('Error al publicar la dieta:', error);
    throw error;
  }
};

export const getDietsByWorkerAndClient = async (workerId: string, clientId: string): Promise<{ dietas: DietaResponse[] }> => {
  try {
    const response = await apiRequest(`/api/diets/worker/${workerId}/client/${clientId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las dietas del cliente');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener dietas por worker y cliente:', error);
    throw error;
  }
};

export const getMyDiets = async (): Promise<{ dietas: DietaResponse[], count: number, message: string }> => {
  try {
    const response = await apiRequest('/api/diets/my-diets', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener mis dietas');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener mis dietas:', error);
    throw error;
  }
};

export const getMyCreatedDiets = async (): Promise<{ dietas: DietaResponse[], count: number, message: string }> => {
  try {
    console.log('🔍 Debug getMyCreatedDiets - Iniciando llamada a /api/diets/my-created-diets');
    const response = await apiRequest('/api/diets/my-created-diets', {
      method: 'GET'
    });
    
    console.log('🔍 Debug getMyCreatedDiets - Respuesta del servidor:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener mis dietas creadas');
    }
    
    const data = await response.json();
    console.log('🔍 Debug getMyCreatedDiets - Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener mis dietas creadas:', error);
    throw error;
  }
};