import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_HOST}/api`;
export interface SuscriptionPlan {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoPrecio: 'Gratuito' | 'Básico' | 'Pro';
  tipoPlan: string | null;
  precioMensual: number;
  precioTrimestral: number;
  precioAnual: number;
  beneficios?: string[];
  isUserSubscribed?: boolean;
}

export interface SuscriptionPlansResponse {
  success: boolean;
  data: {
    plans: SuscriptionPlan[];
    userCurrentPlan: SuscriptionPlan | null;
  };
}

export const getSuscriptionPlans = async (): Promise<SuscriptionPlan[]> => {
  try {
    const url = `${API_BASE_URL}/suscription-plans`;
    
    const response = await axios.get<{success: boolean; data: SuscriptionPlan[]}>(url);
    
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener los planes de suscripción:', error);
    
    return [];
  }
};

export const getPlansWithUserStatus = async (): Promise<SuscriptionPlansResponse | null> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      const plans = await getSuscriptionPlans();
      
      return {
        success: true,
        data: {
          plans,
          userCurrentPlan: null
        }
      };
    }
    
    try {
      const url = `${API_BASE_URL}/suscription-plans/with-user-status`;
      
      const response = await axios.get<SuscriptionPlansResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (authError) {
      if (axios.isAxiosError(authError) && 
          (authError.response?.status === 401 || 
           authError.response?.status === 403 || 
           authError.response?.status === 400)) {
        
        localStorage.removeItem('token');
        const plans = await getSuscriptionPlans();
        
        return {
          success: true,
          data: {
            plans,
            userCurrentPlan: null
          }
        };
      }
      
      throw authError;
    }
  } catch (error) {
    console.error('Error al obtener los planes con estado del usuario:', error);
    try {
      const plans = await getSuscriptionPlans();
      return {
        success: true,
        data: {
          plans,
          userCurrentPlan: null
        }
      };
    } catch {
      return null;
    }
  }
};

export const subscribeToPlan = async (planId: string, frecuenciaPago: 'mensual' | 'trimestral' | 'anual') => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/suscription-plans/subscribe`,
      { planId, frecuenciaPago },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al suscribirse al plan:', error);
    throw error;
  }
};
