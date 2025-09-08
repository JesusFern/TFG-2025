import { DietaResponse } from '../types/diets';
import axios from 'axios';
import { CrearDietaDTO, ApiDietaResponse, Receta, Dieta, Plato, DietaActualizacionDTO, DiaDieta } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST || '';
const API_ENDPOINT = '/api/diets';

export const crearDieta = async (dietaData: CrearDietaDTO): Promise<ApiDietaResponse> => {
  const token = localStorage.getItem('authToken');
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
      
      if (error.response?.status === 401 && 
          (error.response?.data?.message?.includes('expired') || 
           error.response?.data?.error?.includes('expired'))) {
        console.error('Token expirado. Redirigiendo a login...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/worker/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
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

export const obtenerDieta = async (dietaId: string): Promise<Dieta> => {
  console.log(`Intentando obtener dieta con ID: ${dietaId}`);
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    console.log(`URL de la petición: ${API_BASE_URL}${API_ENDPOINT}/${dietaId}`);
    
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}/${dietaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del servidor:', response.data);
    
    if (!response.data || !response.data.dieta) {
      console.error('Estructura de respuesta inesperada:', response.data);
      throw new Error('La respuesta del servidor no contiene los datos esperados');
    }
    
    return response.data.dieta;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error en obtenerDieta (Axios):', error.message);
      console.error('Detalles de la respuesta:', error.response?.data);
      console.error('Código de estado:', error.response?.status);
      
      if (error.response?.status === 404) {
        throw new Error('No se encontró la dieta con el ID proporcionado');
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('No tienes permiso para acceder a esta dieta');
      } else {
        throw new Error(`Error al obtener la dieta: ${error.response?.data?.message || error.message}`);
      }
    }
    console.error('Error no relacionado con Axios:', error);
    throw new Error('Error inesperado al obtener la dieta');
  }
};

export const actualizarDieta = async (dietaId: string, actualizacion: DietaActualizacionDTO): Promise<Dieta> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    console.log('Actualizando dieta con ID:', dietaId);
    console.log('Datos de actualización:', actualizacion);
    
    const response = await axios.patch(`${API_BASE_URL}${API_ENDPOINT}/${dietaId}`, actualizacion, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del servidor:', response.data);
    return response.data.dieta;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor al actualizar dieta:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      console.error('URL de la solicitud:', `${API_BASE_URL}${API_ENDPOINT}/${dietaId}`);
      console.error('Request payload:', error.config?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al actualizar la dieta';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};

export const buscarRecetas = async (termino: string): Promise<Receta[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/recetas/buscar?q=${encodeURIComponent(termino)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.recetas || [];
  } catch (error) {
    console.error('Error en buscarRecetas:', error);
    return [];
  }
};

const formatearPlatoParaBackend = (plato: Plato) => {
  const platoFormateado: {
    _id?: string;
    dietaId?: string;
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
  
  if (typeof plato.comidaIndex === 'number') {
    platoFormateado.comidaIndex = plato.comidaIndex;
  }
  
  if (plato.receta) {
    platoFormateado.receta = plato.receta;
  }
  
  return platoFormateado;
};

export const actualizarPlatos = async (platos: Plato[]): Promise<Plato[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    const platosFormateados = platos.map(formatearPlatoParaBackend);
    
    console.log('Enviando platos para actualizar:', platosFormateados);
    console.log('Datos exactos enviados al servidor:', JSON.stringify({ platos: platosFormateados }, null, 2));
    
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINT}/platos`, 
      { platos: platosFormateados },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta de actualización de platos:', response.data);
    return response.data.platos || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor al actualizar platos:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      console.error('URL de la solicitud:', `${API_BASE_URL}${API_ENDPOINT}/platos`);
      console.error('Request payload:', error.config?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al actualizar los platos';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};

export const crearPlato = async (dietaId: string, diaIndex: number, comidaIndex: number, plato: Plato): Promise<Plato> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    const platoConContexto = {
      ...plato,
      dietaId,
      diaIndex,
      comidaIndex
    };
    
    const platoFormateado = formatearPlatoParaBackend(platoConContexto);
    
    console.log('Enviando plato para crear:', platoFormateado);
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINT}/platos`, 
      { plato: platoFormateado },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta de creación de plato:', response.data);
    return response.data.plato || plato;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor al crear plato:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al crear el plato';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};

export const actualizarDiaDieta = async (
  dietaId: string, 
  diaIndex: number, 
  datosDia: Partial<DiaDieta>
): Promise<DiaDieta> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    console.log(`Actualizando día ${diaIndex} de la dieta ${dietaId}`);
    console.log('Datos de actualización:', datosDia);
    
    const datosFormateados = {
      caloriasTotales: datosDia.caloriasTotales,
      macronutrientes: datosDia.macronutrientes,
      micronutrientes: datosDia.micronutrientes,
      numeroComidas: datosDia.numeroComidas,
      requerimientosHidratacion: datosDia.requerimientosHidratacion,
      cumplimiento: datosDia.cumplimiento,
      comidas: datosDia.comidas ? datosDia.comidas.map(comida => ({
        horaEstimada: comida.horaEstimada,
        nombreComida: comida.nombreComida
      })) : undefined
    };
    
    const response = await axios.patch(
      `${API_BASE_URL}${API_ENDPOINT}/${dietaId}/dias/${diaIndex}`,
      datosFormateados,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta del servidor:', response.data);
    return response.data.dia;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor al actualizar día:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      console.error('URL de la solicitud:', `${API_BASE_URL}${API_ENDPOINT}/${dietaId}/dias/${diaIndex}`);
      console.error('Request payload:', error.config?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al actualizar el día';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};

export const publicarDieta = async (dietaId: string): Promise<Dieta> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  
  try {
    console.log(`Publicando dieta con ID: ${dietaId}`);
    
    const response = await axios.patch(
      `${API_BASE_URL}${API_ENDPOINT}/${dietaId}/publicar`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Respuesta del servidor (publicar dieta):', response.data);
    return response.data.dieta;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error del servidor al publicar dieta:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al publicar la dieta';
      throw new Error(errorMessage);
    } else {
      console.error('Error no relacionado con Axios:', error);
      throw new Error('Error inesperado al comunicarse con el servidor');
    }
  }
};

export const getDietsByWorkerAndClient = async (workerId: string, clientId: string): Promise<{ dietas: DietaResponse[] }> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No autorizado - Inicie sesión para continuar');
  }
  const response = await axios.get(`/api/diets/worker/${workerId}/client/${clientId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};