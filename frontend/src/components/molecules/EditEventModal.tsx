import React, { useRef, useEffect } from 'react';
import {
  Modal,
  Group,
  Button
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import { CalendarEventFormData, GoogleCalendarEvent } from '../../types/googleCalendar';
import EventFormFields from './EventFormFields';

interface EditEventModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CalendarEventFormData) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  loading?: boolean;
  event: GoogleCalendarEvent | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  opened,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
  event
}) => {
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '',
      endDate: new Date(),
      endTime: '',
      location: '',
      attendees: []
    } as CalendarEventFormData,
    validate: {
      title: (value) => (value.length < 1 ? 'El título es requerido' : null),
      startDate: (value) => {
        if (!value) return 'La fecha de inicio es requerida';
        
        // Validar que la fecha de inicio no sea pasada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaInicio = new Date(value);
        fechaInicio.setHours(0, 0, 0, 0);
        
        if (fechaInicio < hoy) {
          return 'La fecha de inicio no puede ser anterior a la fecha actual';
        }
        
        return null;
      },
      startTime: (value) => (value.length < 1 ? 'La hora de inicio es requerida' : null),
      endDate: (value, values) => {
        if (!value) return 'La fecha de fin es requerida';
        
        // Validar que la fecha de fin no sea anterior a la fecha de inicio
        if (values.startDate) {
          const fechaInicio = new Date(values.startDate);
          const fechaFin = new Date(value);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(0, 0, 0, 0);
          
          if (fechaFin < fechaInicio) {
            return 'La fecha de fin no puede ser anterior a la fecha de inicio';
          }
        }
        
        return null;
      },
      endTime: (value, values) => {
        if (value.length < 1) return 'La hora de fin es requerida';
        
        // Si las fechas son iguales, validar que la hora de fin sea posterior a la hora de inicio
        if (values.startDate && values.endDate && values.startTime) {
          const fechaInicio = new Date(values.startDate);
          const fechaFin = new Date(values.endDate);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(0, 0, 0, 0);
          
          if (fechaInicio.getTime() === fechaFin.getTime()) {
            const [horaInicio, minInicio] = values.startTime.split(':').map(Number);
            const [horaFin, minFin] = value.split(':').map(Number);
            
            const tiempoInicio = horaInicio * 60 + minInicio;
            const tiempoFin = horaFin * 60 + minFin;
            
            if (tiempoFin <= tiempoInicio) {
              return 'La hora de fin debe ser posterior a la hora de inicio';
            }
          }
        }
        
        return null;
      },
    }
  });

  // Usar useRef para evitar el bucle infinito
  const formRef = useRef(form);
  formRef.current = form;

  // Actualizar formulario cuando cambie el evento
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      formRef.current.setValues({
        title: event.title,
        description: event.description || '',
        startDate: startDate,
        startTime: startDate.toTimeString().slice(0, 5), // HH:mm
        endDate: endDate,
        endTime: endDate.toTimeString().slice(0, 5), // HH:mm
        location: event.location || '',
        attendees: (event.attendees || []).map((attendee: string | { email: string }) => 
          typeof attendee === 'string' ? attendee : attendee.email
        )
      });
    }
  }, [event]);

  const handleSubmit = async (values: CalendarEventFormData) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error en EditEventModal:', error);
    }
  };

  const handleDelete = async () => {
    if (event) {
      try {
        await onDelete(event.id);
        form.reset();
        onClose();
      } catch (error) {
        // El error se maneja en el componente padre
        console.error('Error en EditEventModal delete:', error);
      }
    }
  };

  if (!event) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Editar Evento"
      size="md"
      zIndex={1000}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <EventFormFields form={form} />
        
        <Group justify="space-between" mt="md">
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={handleDelete}
            loading={loading}
          >
            Eliminar
          </Button>
          <Group gap="sm">
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Actualizar Evento
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
};

export default EditEventModal;
