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