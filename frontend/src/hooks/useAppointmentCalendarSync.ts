import { useCallback } from 'react';
import { useGoogleCalendar } from './useGoogleCalendar';
import { CitaService } from '../services/citaService';
import type { Cita } from '../types/citas';

// Extender la interfaz Cita para incluir googleEventId
interface CitaConGoogleEvent extends Cita {
  googleEventId?: string;
}

export const useAppointmentCalendarSync = () => {
  const { createEvent, deleteEvent } = useGoogleCalendar();

  const syncAppointmentOnConfirm = useCallback(async (
    appointmentId: string,
    clientEmail: string,
    professionalEmail: string
  ) => {
    try {
      // Obtener la cita confirmada
      const cita = await CitaService.obtenerCitaPorId(appointmentId);

      // Crear evento en Google Calendar
      const eventData = {
        title: `📅 ${cita.tipo} - ${cita.motivo}`,
        description: `Cita de ${cita.tipo}\nMotivo: ${cita.motivo}`,
        start: new Date(cita.fecha).toISOString(),
        end: new Date(new Date(cita.fecha).getTime() + cita.duracion * 60000).toISOString(),
        location: 'Ubicación por definir',
        attendees: [clientEmail, professionalEmail]
      };

      await createEvent(eventData);
      
      // TODO: Implementar almacenamiento del eventId cuando esté disponible
      console.log('Cita sincronizada con Google Calendar');

    } catch (error) {
      console.error('Error sincronizando cita con calendario:', error);
      throw error;
    }
  }, [createEvent]);

  const syncAppointmentOnCancel = useCallback(async (appointmentId: string) => {
    try {
      // Obtener la cita para verificar si tiene eventId
      const cita = await CitaService.obtenerCitaPorId(appointmentId);
      const citaConGoogleEvent = cita as CitaConGoogleEvent;

      if (citaConGoogleEvent.googleEventId) {
        // Eliminar evento del calendario
        await deleteEvent(citaConGoogleEvent.googleEventId);
        
        // Limpiar el eventId de la cita
        await CitaService.limpiarEventoId(cita._id);

        console.log('Cita eliminada del Google Calendar');
      }

    } catch (error) {
      console.error('Error eliminando cita del calendario:', error);
      throw error;
    }
  }, [deleteEvent]);

  const syncAppointmentOnReschedule = useCallback(async (appointmentId: string) => {
    try {
      // Reutilizar la función de eliminación existente
      await syncAppointmentOnCancel(appointmentId);
      console.log('Evento de cita reagendada eliminado del Google Calendar');

    } catch (error) {
      console.error('Error eliminando evento de cita reagendada:', error);
      throw error;
    }
  }, [syncAppointmentOnCancel]);

  return {
    syncAppointmentOnConfirm,
    syncAppointmentOnReschedule,
    syncAppointmentOnCancel
  };
};