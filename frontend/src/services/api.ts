// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    users: {
      register: '/api/users/register',
      login: '/api/users/login',
      validateStep: (step: number) => `/api/users/validate-step/${step}`,
    },
  },
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  // Obtener el token del localStorage (clave unificada)
  const token = localStorage.getItem('authToken');
  
  // Si el body es FormData, no establecer Content-Type
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  // Agregar token de autorización si existe y no se ha enviado explícitamente
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const defaultOptions: RequestInit = {
    headers,
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  // Si la respuesta es 401, el token puede haber expirado
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    // No redirigir automáticamente, dejar que el componente maneje el error
    const errorData = await response.json().catch(() => ({ message: 'Token expirado' }));
    throw new Error(errorData.message || 'Token expirado');
  }
  
  return response;
};
