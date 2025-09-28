import { useCallback } from 'react';
import { useGoogleCalendar } from './useGoogleCalendar';
import { useEventNotifications } from './useEventNotifications';
import { CalendarEventFormData } from '../types/googleCalendar';

export const useEventHandlers = () => {
  const { createEvent, updateEvent, deleteEvent } = useGoogleCalendar();
  const notifications = useEventNotifications();

  const handleCreateEvent = useCallback(async (values: CalendarEventFormData) => {
    try {
      // Combinar fecha y hora para crear fechas completas
      const startDate = new Date(values.startDate);
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(values.endDate);
      const [endHours, endMinutes] = values.endTime.split(':').map(Number);
      endDate.setHours(endHours, endMinutes, 0, 0);

      await createEvent({
        title: values.title,
        description: values.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });
      
      notifications.showEventCreatedSuccess();
    } catch (error) {
      console.error('Error creando evento:', error);
      notifications.showEventCreateError(error);
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
  }, [createEvent, notifications]);

  const handleUpdateEvent = useCallback(async (eventId: string, values: CalendarEventFormData) => {
    try {
      // Combinar fecha y hora para crear fechas completas
      const startDate = new Date(values.startDate);
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(values.endDate);
      const [endHours, endMinutes] = values.endTime.split(':').map(Number);
      endDate.setHours(endHours, endMinutes, 0, 0);

      await updateEvent(eventId, {
        title: values.title,
        description: values.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: values.location,
        attendees: values.attendees.filter((email: string) => email.trim() !== '')
      });
      
      notifications.showEventUpdatedSuccess();
    } catch (error) {
      console.error('Error actualizando evento:', error);
      notifications.showEventUpdateError(error);
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
  }, [updateEvent, notifications]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      notifications.showEventDeletedSuccess();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      notifications.showEventDeleteError(error);
      throw error; // Re-lanzar para que el modal pueda manejarlo
    }
  }, [deleteEvent, notifications]);

  return {
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent
  };
};
