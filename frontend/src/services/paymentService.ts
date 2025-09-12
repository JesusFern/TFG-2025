import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const createCheckoutSession = async (
  planId: string,
  frecuenciaPago: 'mensual' | 'trimestral' | 'anual'
): Promise<CheckoutResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Token de autenticación:', token ? 'Presente' : 'No encontrado');
    console.log('URL de la API:', API_BASE_URL);
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
    const requestUrl = `${API_BASE_URL}/suscription-plans/subscribe`;
    
    console.log('Enviando petición a:', requestUrl);
    console.log('Datos de la petición:', requestData);
    console.log('Headers:', {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const response = await axios.put<CheckoutResponse>(
      requestUrl,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
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

    const response = await axios.get<PaymentStatus>(
      `${API_BASE_URL}/suscription-plans/payment/status/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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

    const response = await axios.get<PaymentStatus>(
      `${API_BASE_URL}/suscription-plans/payment/confirm?sessionId=${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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

    const response = await axios.get<SubscriptionResponse>(
      `${API_BASE_URL}/suscription-plans/my-subscription`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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