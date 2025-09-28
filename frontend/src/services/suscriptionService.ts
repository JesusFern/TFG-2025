import { apiRequest } from './api';

export interface SuscriptionPlan {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoPrecio: 'Gratuito' | 'Básico' | 'Pro';
  tipoPlan: 'Nutricion' | 'Entrenamiento personal' | 'Nutrición y entrenamiento personal' | null;
  precioMensual: number;
  precioTrimestral: number;
  precioAnual: number;
  beneficios: string[];
}

export interface UserSuscription {
  _id: string;
  userId: string;
  planId: string;
  plan: SuscriptionPlan;
  fechaInicio: string;
  fechaFin: string;
  frecuenciaDePago: 'Mensual' | 'Trimestral' | 'Anual';
  estadoPago: 'pendiente' | 'pagado' | 'vencido';
  fechaProximoPago?: string;
  isActive: boolean;
}

export interface SuscriptionStatus {
  hasSuscription: boolean;
  suscription?: UserSuscription;
  canAccessNutrition: boolean;
  canAccessTraining: boolean;
  message?: string;
}

// Servicio para obtener el estado de suscripción del usuario
export const getSuscriptionStatus = async (): Promise<SuscriptionStatus> => {
  try {
    const response = await apiRequest('/api/suscription-plans/status', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estado de suscripción');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    throw error;
  }
};

// Servicio para obtener planes de suscripción disponibles
export const getAvailablePlans = async (): Promise<SuscriptionPlan[]> => {
  try {
    const response = await apiRequest('/api/suscription-plans', {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener planes de suscripción');
    }
    
    const data = await response.json();
    return data.data || data; // Manejar diferentes formatos de respuesta
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    throw error;
  }
};
