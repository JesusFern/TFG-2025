// Configuración de la API
const API_BASE_URL = 'http://localhost:5000';

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
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  

  
    const response = await fetch(url, defaultOptions);
    
    
    // Si la respuesta es 401, el token puede haber expirado
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return response;
    }
    
  return response;
  
};
