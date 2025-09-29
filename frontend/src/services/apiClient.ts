import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:5000';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Si la respuesta es 401, el token puede haber expirado
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Redirigir al login si es necesario
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
