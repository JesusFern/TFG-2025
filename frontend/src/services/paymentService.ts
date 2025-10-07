import { apiClient } from './apiClient';
import { AxiosError } from 'axios';

export interface CheckoutResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  message?: string;
  redirect?: string;
  freeSubscription?: boolean;
}

export interface PaymentStatus {
  success: boolean;
  payment?: {
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    paymentDate?: Date;
  };
  message?: string;
  subscription?: UserSubscription;
}

export interface ErrorResponse {
  message: string;
  status?: number;
}

export interface UserSubscription {
  id: string;
  planId: {
    _id: string;
    nombre: string;
    descripcion: string;
    tipoPrecio: string;
    tipoPlan: string | null;
    precioMensual: number;
    precioTrimestral: number;
    precioAnual: number;
    beneficios: string[];
  };
  userId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'expirada' | 'cancelada';
  frecuenciaPago: 'mensual' | 'trimestral' | 'anual';
}

export interface SubscriptionResponse {
  success: boolean;
  status?: 'activa' | 'expirada' | 'cancelada' | 'no-subscription';
  subscription?: UserSubscription;
  message?: string;
}

export const createUpgradeCheckoutSession = async (
  planId: string,
  frecuenciaPago: 'mensual' | 'trimestral' | 'anual'
): Promise<CheckoutResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Token de autenticación:', token ? 'Presente' : 'No encontrado');
    console.log('Plan ID:', planId);
    console.log('Frecuencia de pago:', frecuenciaPago);
    
    if (!token) {
      console.error('No hay token de autenticación');
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const requestData = { planId, frecuenciaPago };
    
    console.log('Enviando petición de upgrade');
    console.log('Datos de la petición:', requestData);

    const response = await apiClient.put<CheckoutResponse>(
      '/suscription-plans/upgrade',
      requestData
    );

    console.log('Respuesta del servidor (upgrade):', response.data);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error completo al crear sesión de upgrade:', error);
    console.error('Error de Axios:', axiosError);
    console.error('Respuesta del error:', axiosError.response);
    console.error('Status del error:', axiosError.response?.status);
    console.error('Datos del error:', axiosError.response?.data);
    
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Error al procesar el upgrade'
    };
  }
};

export const createCheckoutSession = async (
  planId: string,
  frecuenciaPago: 'mensual' | 'trimestral' | 'anual'
): Promise<CheckoutResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Token de autenticación:', token ? 'Presente' : 'No encontrado');
    console.log('Plan ID:', planId);
    console.log('Frecuencia de pago:', frecuenciaPago);
    
    if (!token) {
      console.error('No hay token de autenticación');
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const requestData = { planId, frecuenciaPago };
    
    console.log('Enviando petición de suscripción');
    console.log('Datos de la petición:', requestData);

    const response = await apiClient.put<CheckoutResponse>(
      '/suscription-plans/subscribe',
      requestData
    );

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error completo al crear sesión de checkout:', error);
    console.error('Error de Axios:', axiosError);
    console.error('Respuesta del error:', axiosError.response);
    console.error('Status del error:', axiosError.response?.status);
    console.error('Datos del error:', axiosError.response?.data);
    
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Error al procesar el pago'
    };
  }
};

export const checkPaymentStatus = async (sessionId: string): Promise<PaymentStatus> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const response = await apiClient.get<PaymentStatus>(
      `/suscription-plans/payment/status/${sessionId}`
    );

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error al verificar el estado del pago:', error);
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Error al verificar el pago'
    };
  }
};

export const confirmPayment = async (sessionId: string): Promise<PaymentStatus> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const response = await apiClient.get<PaymentStatus>(
      `/suscription-plans/payment/confirm?sessionId=${sessionId}`
    );

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error al confirmar el pago:', error);
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Error al confirmar el pago'
    };
  }
};

export const getUserSubscription = async (): Promise<SubscriptionResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }

    const response = await apiClient.get<SubscriptionResponse>(
      `/suscription-plans/my-subscription`
    );

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        status: 'no-subscription',
        message: 'No tienes ninguna suscripción activa'
      };
    }
    
    if (axiosError.response?.status === 401) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      };
    }
    
    console.error('Error al obtener la suscripción del usuario:', error);
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Error al obtener suscripción'
    };
  }
};