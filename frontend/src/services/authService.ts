import axios, { AxiosError } from 'axios';

const API_URL = '/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: UserData;
  message: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  workerType?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

interface ApiError {
  message: string;
  status?: number;
  [key: string]: unknown;
}

interface RawUserData {
  id?: string;
  _id?: string;
  fullName?: string;
  nombre?: string;
  name?: string;
  email?: string;
  role?: string;
  workerType?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

interface WorkerData {
  fullName: string;
  email: string;
  password: string;
  workerType: string;
  profilePicture?: string;
  specialties?: string[];
  bio?: string;
  [key: string]: unknown;
}

interface WorkerRegisterResponse {
  success: boolean;
  message: string;
  worker?: UserData;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const endpoint = `${API_URL}/users/login`;
    
    const response = await axios.post<LoginResponse>(endpoint, {
      email: credentials.email,
      password: credentials.password
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error de autenticación');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export const registerUser = async (userData: Omit<UserData, 'id' | 'role'> & { password: string }): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al registrar usuario');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export const registerWorker = async (workerData: WorkerData): Promise<WorkerRegisterResponse> => {
  try {
    const response = await axios.post<WorkerRegisterResponse>(`${API_URL}/workers/register`, workerData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data.message || 'Error al registrar trabajador');
    }
    throw new Error('Error de conexión al servidor');
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('authToken') !== null;
};

export const getUserRole = (): string | null => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData) as UserData;
    return user.role;
  } catch {
    return null;
  }
};

export const isWorker = (): boolean => {
  const role = getUserRole();
  return role === 'worker' || role === 'admin';
};

export const getUserData = (): UserData | null => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as UserData;
  } catch {
    return null;
  }
};

export const getClientById = async (clientId: string): Promise<UserData> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No autorizado - Inicie sesión para continuar');
    }
    
    console.log(`Intentando obtener información del cliente con ID: ${clientId}`);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST || '';
    const endpoint = `${API_BASE_URL}/api/workers/client/${clientId}`;
    console.log(`URL del endpoint: ${endpoint}`);
    
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del servidor (getClientById):', response.data);
    
    // Verificar diferentes estructuras posibles de la respuesta
    let userData: RawUserData = {};
    
    if (response.data.user) {
      userData = response.data.user;
    } else if (response.data.data && response.data.data.user) {
      userData = response.data.data.user;
    } else if (response.data.data) {
      userData = response.data.data;
    } else if (response.data.cliente) {
      userData = response.data.cliente;
    } else {
      userData = response.data;
    }
    
    console.log('Datos del usuario extraídos:', userData);
    
    // Crear un objeto que cumpla con la interfaz UserData
    const userDataFormatted: UserData = {
      id: userData.id || userData._id || clientId,
      fullName: userData.fullName || userData.nombre || userData.name || 'Usuario',
      email: userData.email || 'no-email',
      role: userData.role || 'client'
    };
    
    console.log('Datos del usuario formateados:', userDataFormatted);
    
    return userDataFormatted;
  } catch (error: unknown) {
    console.error('Error en getClientById:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Detalles del error:', axiosError.response?.data);
      
      // Si el endpoint /api/workers/client/:id falla, intentamos con /api/users/:id
      try {
        console.log('Intentando endpoint alternativo');
        const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST || '';
        const alternativeEndpoint = `${API_BASE_URL}/api/users/${clientId}`;
        console.log(`URL del endpoint alternativo: ${alternativeEndpoint}`);
        
        const alternativeResponse = await axios.get(alternativeEndpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Respuesta del servidor (endpoint alternativo):', alternativeResponse.data);
        
        const userData: RawUserData = alternativeResponse.data.user || alternativeResponse.data.data || alternativeResponse.data;
        
        return {
          id: userData.id || userData._id || clientId,
          fullName: userData.fullName || userData.nombre || userData.name || 'Usuario',
          email: userData.email || 'no-email',
          role: userData.role || 'client'
        };
      } catch (alternativeError) {
        console.error('Error en endpoint alternativo:', alternativeError);
      }
      
      throw new Error(axiosError.response?.data.message || 'Error al obtener información del cliente');
    }
    throw new Error('Error de conexión al servidor');
  }
};