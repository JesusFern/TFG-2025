import { apiClient } from './apiClient';
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
    const response = await apiClient.get<{success: boolean; data: SuscriptionPlan[]}>('/suscription-plans');
    
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener los planes de suscripción:', error);
    
    return [];
  }
};

export const getSuscriptionPlanById = async (planId: string): Promise<SuscriptionPlan | null> => {
  try {
    const response = await apiClient.get<{success: boolean; data: SuscriptionPlan}>(`/suscription-plans/${planId}`);
    
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener el plan de suscripción:', error);
    
    return null;
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
      const response = await apiClient.get<SuscriptionPlansResponse>('/suscription-plans/with-user-status');
      
      return response.data;
    } catch (authError: unknown) {
      if (authError && typeof authError === 'object' && 'response' in authError) {
        const axiosError = authError as { response?: { status: number } };
        if (axiosError.response?.status === 401 || 
            axiosError.response?.status === 403 || 
            axiosError.response?.status === 400) {
          
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
    
    const response = await apiClient.put(
      '/suscription-plans/subscribe',
      { planId, frecuenciaPago }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al suscribirse al plan:', error);
    throw error;
  }
};
