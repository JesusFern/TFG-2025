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

export interface ProfessionalResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  workerType: string;
  isWorkerAvailable: boolean;
  profilePicture?: string;
  biography?: string;
  availability?: string;
  clientesAsignados?: string[];
  satisfactionRating?: number;
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

export const getAvailableProfessionals = async (): Promise<ProfessionalResponse[]> => {
  try {
    const response = await axios.get<ProfessionalResponse[]>(`${API_URL}/users/workers/available`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener profesionales disponibles');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface AssignmentStatusResponse {
  hasAssignedWorkers: boolean;
  assignedWorkersCount: number;
  assignedWorkers: Array<{
    _id: string;
    fullName: string;
    workerType: string;
    profilePicture?: string;
  }>;
}

export const checkAssignmentStatus = async (): Promise<AssignmentStatusResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<AssignmentStatusResponse>(`${API_URL}/users/assignment-status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al verificar estado de asignación');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export const getProfessionalsBySubscription = async (): Promise<ProfessionalResponse[]> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<{ data: { workers: ProfessionalResponse[] } }>(`${API_URL}/users/available-workers-by-my-suscription`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data.workers;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener profesionales por suscripción');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  subscriptionType: string | null;
  fullPlanName: string | null;
  isExpired: boolean;
}

export const checkSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<SubscriptionStatusResponse>(`${API_URL}/users/subscription-status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al verificar estado de suscripción');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface WorkerCompatibilityResponse {
  canContact: boolean;
  canRequestAssignment: boolean;
  reason?: string;
}

export const checkWorkerCompatibility = async (workerType: string): Promise<WorkerCompatibilityResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<WorkerCompatibilityResponse>(`${API_URL}/users/worker-compatibility/${encodeURIComponent(workerType)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al verificar compatibilidad con trabajador');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface CreateAssignmentRequestData {
  trabajadorSolicitado: string;
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  message?: string;
}

export interface AssignmentRequestResponse {
  _id: string;
  userId: string;
  workerId: string;
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const createAssignmentRequest = async (data: CreateAssignmentRequestData): Promise<AssignmentRequestResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.post<AssignmentRequestResponse>(`${API_URL}/assignment-requests/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al procesar la solicitud de asignación');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface PendingAssignmentRequest {
  _id: string;
  trabajadorSolicitado: {
    _id: string;
    fullName: string;
    email: string;
    workerType: string;
  };
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  createdAt: string;
  updatedAt: string;
}

export const getPendingAssignmentRequests = async (): Promise<PendingAssignmentRequest[]> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<{requests: AssignmentRequestFull[], count: number, message: string}>(`${API_URL}/assignment-requests/requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Filtrar solo las solicitudes pendientes
    const pendingRequests = response.data.requests
      .filter(request => request.estado === 'pendiente')
      .map(request => ({
        _id: request._id,
        trabajadorSolicitado: request.trabajadorSolicitado,
        tipoAsignacion: request.tipoAsignacion,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }));
    
    return pendingRequests;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener solicitudes pendientes');
    }
    throw new Error('Error de conexión al servidor');
  }
};

// Interfaces para las solicitudes completas
export interface AssignmentRequestFull {
  _id: string;
  usuarioSolicitante: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  trabajadorSolicitado: {
    _id: string;
    fullName: string;
    email: string;
    workerType: string;
    profilePicture?: string;
  };
  tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequestsResponse {
  message: string;
  requests: AssignmentRequestFull[];
  count: number;
}

// Función para obtener todas las solicitudes según el rol del usuario
export const getAssignmentRequests = async (): Promise<AssignmentRequestFull[]> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<AssignmentRequestsResponse>(`${API_URL}/assignment-requests/requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.requests;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al obtener solicitudes');
    }
    throw new Error('Error de conexión al servidor');
  }
};

// Función para actualizar el estado de una solicitud (aceptar/rechazar)
export const updateAssignmentRequestStatus = async (
  requestId: string, 
  status: 'aceptada' | 'rechazada'
): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    await axios.patch(`${API_URL}/assignment-requests/${requestId}/status`, 
      { estado: status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al actualizar solicitud');
    }
    throw new Error('Error de conexión al servidor');
  }
};

// Función para cancelar una solicitud
export const cancelAssignmentRequest = async (requestId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    await axios.delete(`${API_URL}/assignment-requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al cancelar solicitud');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface AssignmentAvailabilityResponse {
  message: string;
  availableTypes: string[];
  workerType: string;
  userPlan: string;
}

export const checkAssignmentAvailability = async (workerId: string): Promise<AssignmentAvailabilityResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get<AssignmentAvailabilityResponse>(`${API_URL}/assignment-requests/check-availability/${workerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al verificar disponibilidad');
    }
    throw new Error('Error de conexión al servidor');
  }
};

// Interfaces para registro de trabajadores
export interface WorkerRegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthDate: string; // Formato YYYY-MM-DD
  gender: 'Masculino' | 'Femenino' | 'Otro';
  workerType: 'Entrenador personal' | 'Nutricionista' | 'Nutricionista y Entrenador personal';
  biography: string;
  availability: string;
  profilePicture?: string; // Base64 string
}

export interface WorkerRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    workerType: string;
    biography: string;
    availability: string;
    gender: string;
    birthDate: string;
    profilePicture?: string;
    isWorkerAvailable: boolean;
    satisfactionRating: number;
    clientesAsignados: Array<{
      clienteId: {
        _id: string;
        fullName: string;
        email: string;
      };
      tipoAsignacion: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export const registerWorker = async (workerData: WorkerRegistrationData): Promise<WorkerRegistrationResponse> => {
  try {
    const { apiRequest } = await import('./api');
    
    const response = await apiRequest('/api/admin/workers/register', {
      method: 'POST',
      body: JSON.stringify(workerData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar trabajador');
    }
    
    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión al servidor');
  }
};

export interface AssignedWorker {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  workerType: string;
  biography?: string;
  availability?: string;
  profilePicture?: string;
  satisfactionRating?: number;
  asignaciones: Array<{
    clienteId: string;
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  }>;
}

export const getAssignedWorkers = async (): Promise<AssignedWorker[]> => {
  try {
    const { apiRequest } = await import('./api');
    
    // Obtener el ID del usuario actual desde el token o desde el contexto
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = user._id;

    console.log('getAssignedWorkers - userId:', userId);
    console.log('getAssignedWorkers - user:', user);

    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await apiRequest(`/api/users/workers/assigned/${userId}`, {
      method: 'GET',
    });

    console.log('getAssignedWorkers - response status:', response.status);
    console.log('getAssignedWorkers - response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('getAssignedWorkers - error data:', errorData);
      throw new Error(errorData.message || 'Error al obtener los trabajadores asignados');
    }

    const data = await response.json();
    console.log('getAssignedWorkers - data:', data);
    return data || [];
  } catch (error) {
    console.error('Error al obtener trabajadores asignados:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
};

export interface AssignedClient {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  asignaciones: Array<{
    clienteId: string;
    tipoAsignacion: 'Nutricionista' | 'Entrenador personal';
  }>;
}

export const getClientsAssignedToWorker = async (workerId: string): Promise<AssignedClient[]> => {
  try {
    const { apiRequest } = await import('./api');

    const response = await apiRequest(`/api/users/clients/assigned/${workerId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener los clientes asignados');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error al obtener clientes asignados:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
};