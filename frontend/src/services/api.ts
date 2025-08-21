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
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('Error en petición API:', error);
    throw error;
  }
};
