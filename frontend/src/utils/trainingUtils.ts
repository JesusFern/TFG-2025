import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Utilidades compartidas para el módulo de entrenamiento

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Fecha no válida';
  }
};

export const formatDateWithLocale = (date: Date): string => {
  return format(date, 'dd/MM', { locale: es });
};

export const formatDateLong = (date: Date): string => {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
};

export const getWeekStartDate = (fechaInicio: Date, currentWeek: number): Date => {
  // Las semanas empiezan exactamente desde la fecha de inicio del plan
  const weekStartDate = new Date(fechaInicio);
  weekStartDate.setDate(weekStartDate.getDate() + (currentWeek - 1) * 7);
  
  return weekStartDate;
};

export const getWeekEndDate = (weekStartDate: Date): Date => {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  return weekEndDate;
};

export const getClientIdFromPlan = (plan: { clientes?: unknown[] }): string | null => {
  if (plan && plan.clientes && Array.isArray(plan.clientes) && plan.clientes.length > 0) {
    const clientData = plan.clientes[0];
    
    if (typeof clientData === 'string') {
      return clientData;
    } 
    else if (typeof clientData === 'object' && clientData !== null) {
      type ClientObject = { _id?: string; id?: string; };
      const clientObj = clientData as unknown as ClientObject;
      
      if (clientObj._id) {
        return clientObj._id;
      } else if (clientObj.id) {
        return clientObj.id;
      } else {
        return String(clientData);
      }
    }
    else if (clientData) {
      return String(clientData);
    }
  }
  return null;
};
