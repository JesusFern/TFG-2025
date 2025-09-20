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
