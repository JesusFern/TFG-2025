import { apiRequest } from './api';

export interface ClienteWorker {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'user';
  gender?: string;
  birthDate?: string;
  profilePicture?: string;
  datosSaludYNutricion?: string;
  datosActividadFisica?: string;
  suscripcion?: string;
}

export interface ClienteAsignado {
  clienteId: string;
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  cliente: ClienteWorker;
}

/**
 * Helper function para hacer requests con parámetros de semana y año
 */
const makeWorkerStatsRequest = async (
  endpoint: string, 
  clienteId: string, 
  errorMessage: string,
  semana?: number, 
  año?: number
) => {
  const params = new URLSearchParams();
  if (semana) params.append('semana', semana.toString());
  if (año) params.append('año', año.toString());
  
  const response = await apiRequest(`${endpoint}/${clienteId}?${params.toString()}`, {
    method: 'GET'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorMessage);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Obtener los clientes asignados al trabajador actual
 */
export const getClientesAsignados = async (): Promise<ClienteAsignado[]> => {
  try {
    // Usar el endpoint existente que obtiene los clientes asignados al trabajador actual
    const response = await apiRequest('/api/users/clients/assigned/me', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener clientes asignados');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error al obtener clientes asignados:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas nutricionales de un cliente específico
 */
export const getEstadisticasNutricionalesCliente = async (clienteId: string, semana?: number, año?: number) => {
  try {
    return await makeWorkerStatsRequest(
      '/api/users/workers/estadisticas-nutricionales',
      clienteId,
      'Error al obtener estadísticas nutricionales del cliente',
      semana,
      año
    );
  } catch (error) {
    console.error('Error al obtener estadísticas nutricionales del cliente:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de entrenamiento de un cliente específico
 */
export const getEstadisticasEntrenamientoCliente = async (clienteId: string, semana?: number, año?: number) => {
  try {
    return await makeWorkerStatsRequest(
      '/api/users/workers/estadisticas-entrenamiento',
      clienteId,
      'Error al obtener estadísticas de entrenamiento del cliente',
      semana,
      año
    );
  } catch (error) {
    console.error('Error al obtener estadísticas de entrenamiento del cliente:', error);
    throw error;
  }
};