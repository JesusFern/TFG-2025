import { apiClient } from './apiClient';
import { UserTrackingDto, CreateUserTrackingDto, UpdateUserTrackingDto, ArchivoMultimedia } from '../types/userTracking';

export const userTrackingService = {

  /**
   * Obtener todos los registros de seguimiento del usuario autenticado
   */
  getMe: async () => {
    const res = await apiClient.get('/api/user-tracking/me');
    return res.data as { success: boolean; data: UserTrackingDto[] };
  },


  /**
   * Actualizar un registro de seguimiento existente
   */
  update: async (id: string, data: UpdateUserTrackingDto) => {
    const res = await apiClient.put(`/api/user-tracking/${id}`, data);
    return res.data as { success: boolean; data: UserTrackingDto };
  },



  /**
   * Guardar seguimiento completo (crear nuevo registro)
   */
  guardarSeguimientoCompleto: async (data: CreateUserTrackingDto) => {
    const res = await apiClient.post('/api/user-tracking/me/guardar', data);
    return res.data as { success: boolean; data: UserTrackingDto };
  },

  /**
   * Subir archivo multimedia a un registro específico
   */
  uploadArchivoMultimedia: async (trackingId: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const res = await apiClient.post(`/api/user-tracking/${trackingId}/archivos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as { success: boolean; data: UserTrackingDto; archivo: ArchivoMultimedia };
  },

  /**
   * Eliminar archivo multimedia de un registro específico
   */
  removeArchivoMultimedia: async (trackingId: string, archivoPath: string) => {
    const res = await apiClient.delete(`/api/user-tracking/${trackingId}/archivos/${encodeURIComponent(archivoPath)}`);
    return res.data as { success: boolean; data: UserTrackingDto };
  },

  /**
   * Obtener seguimiento de un cliente para un trabajador
   */
  getByUserIdForWorker: async (userId: string) => {
    const res = await apiClient.get(`/api/user-tracking/cliente/${userId}`);
    return res.data as { success: boolean; data: UserTrackingDto[] };
  }
};