import { Notificacion } from '../types/notifications';

/**
 * Convierte una notificación a formato estándar con fechas como strings ISO
 * @param notificacion - La notificación a convertir
 * @returns La notificación convertida con fechas como strings ISO
 */
export const convertNotificationToStandard = (notificacion: Notificacion): Notificacion => {
  // Helper para convertir fecha a ISO string de forma segura (campos opcionales)
  const toISOStringSafe = (fecha: Date | string | undefined): string | undefined => {
    if (!fecha) return undefined;
    if (typeof fecha === 'string') return fecha;
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      return fecha.toISOString();
    }
    return undefined;
  };
  
  // Helper para convertir fecha a ISO string (campos obligatorios con fallback)
  const toISOStringRequired = (fecha: Date | string | undefined): string => {
    if (!fecha) return new Date().toISOString();
    if (typeof fecha === 'string') return fecha;
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      return fecha.toISOString();
    }
    return new Date().toISOString();
  };
  
  return {
    ...notificacion,
    programadaPara: toISOStringSafe(notificacion.programadaPara),
    expiraEn: toISOStringSafe(notificacion.expiraEn),
    createdAt: toISOStringRequired(notificacion.createdAt),
    updatedAt: toISOStringRequired(notificacion.updatedAt)
  };
};

/**
 * Convierte una notificación a formato con fechas como objetos Date
 * @param notificacion - La notificación a convertir
 * @returns La notificación convertida con fechas como objetos Date
 */
export const convertNotificationToDate = (notificacion: Notificacion): Notificacion => {
  // Helper para convertir a Date de forma segura (campos opcionales)
  const toDateSafe = (fecha: Date | string | undefined): Date | undefined => {
    if (!fecha) return undefined;
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha;
    if (typeof fecha === 'string') {
      const date = new Date(fecha);
      return !isNaN(date.getTime()) ? date : undefined;
    }
    return undefined;
  };
  
  // Helper para convertir a Date (campos obligatorios con fallback)
  const toDateRequired = (fecha: Date | string | undefined): Date => {
    if (!fecha) return new Date();
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha;
    if (typeof fecha === 'string') {
      const date = new Date(fecha);
      return !isNaN(date.getTime()) ? date : new Date();
    }
    return new Date();
  };
  
  return {
    ...notificacion,
    programadaPara: toDateSafe(notificacion.programadaPara),
    expiraEn: toDateSafe(notificacion.expiraEn),
    createdAt: toDateRequired(notificacion.createdAt),
    updatedAt: toDateRequired(notificacion.updatedAt)
  };
};
