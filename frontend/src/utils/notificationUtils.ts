import { Notificacion } from '../types/notifications';

/**
 * Convierte una notificación a formato estándar con fechas como strings ISO
 * @param notificacion - La notificación a convertir
 * @returns La notificación convertida con fechas como strings ISO
 */
export const convertNotificationToStandard = (notificacion: Notificacion): Notificacion => {
  return {
    ...notificacion,
    programadaPara: notificacion.programadaPara ? 
      (typeof notificacion.programadaPara === 'string' ? 
        notificacion.programadaPara : 
        notificacion.programadaPara.toISOString()) : 
      undefined,
    expiraEn: notificacion.expiraEn ? 
      (typeof notificacion.expiraEn === 'string' ? 
        notificacion.expiraEn : 
        notificacion.expiraEn.toISOString()) : 
      undefined,
    createdAt: notificacion.createdAt ? 
      (typeof notificacion.createdAt === 'string' ? 
        notificacion.createdAt : 
        notificacion.createdAt.toISOString()) : 
      new Date().toISOString(),
    updatedAt: notificacion.updatedAt ? 
      (typeof notificacion.updatedAt === 'string' ? 
        notificacion.updatedAt : 
        notificacion.updatedAt.toISOString()) : 
      new Date().toISOString()
  };
};

/**
 * Convierte una notificación a formato con fechas como objetos Date
 * @param notificacion - La notificación a convertir
 * @returns La notificación convertida con fechas como objetos Date
 */
export const convertNotificationToDate = (notificacion: Notificacion): Notificacion => {
  return {
    ...notificacion,
    programadaPara: notificacion.programadaPara ? 
      (typeof notificacion.programadaPara === 'string' ? 
        new Date(notificacion.programadaPara) : 
        notificacion.programadaPara) : 
      undefined,
    expiraEn: notificacion.expiraEn ? 
      (typeof notificacion.expiraEn === 'string' ? 
        new Date(notificacion.expiraEn) : 
        notificacion.expiraEn) : 
      undefined,
    createdAt: notificacion.createdAt ? 
      (typeof notificacion.createdAt === 'string' ? 
        new Date(notificacion.createdAt) : 
        notificacion.createdAt) : 
      new Date(),
    updatedAt: notificacion.updatedAt ? 
      (typeof notificacion.updatedAt === 'string' ? 
        new Date(notificacion.updatedAt) : 
        notificacion.updatedAt) : 
      new Date()
  };
};
