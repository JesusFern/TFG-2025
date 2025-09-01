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
  
  console.log('🌐 apiRequest: Iniciando petición a:', url);
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('token');
  console.log('🔑 apiRequest: Token encontrado:', token ? 'Sí' : 'No');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('⚙️ apiRequest: Opciones de la petición:', defaultOptions);

  try {
    console.log('📡 apiRequest: Enviando petición...');
    const response = await fetch(url, defaultOptions);
    
    console.log('📨 apiRequest: Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    
    // Si la respuesta es 401, el token puede haber expirado
    if (response.status === 401) {
      console.warn('❌ apiRequest: Token expirado o inválido, redirigiendo al login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('❌ apiRequest: Error en petición:', error);
    throw error;
  }
};
