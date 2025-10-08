import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Group,
  Button
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { CalendarEventFormData } from '../../types/googleCalendar';
import EventFormFields from './EventFormFields';

interface CreateEventModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CalendarEventFormData) => Promise<void>;
  loading?: boolean;
  initialValues?: Partial<CalendarEventFormData>;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  opened,
  onClose,
  onSubmit,
  loading = false,
  initialValues = {}
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
      attendees: [],
      ...initialValues
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

  const formRef = useRef(form);
  formRef.current = form;

  // Actualizar el formulario cuando cambien los initialValues
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      formRef.current.setValues({
        title: initialValues.title || '',
        description: initialValues.description || '',
        startDate: initialValues.startDate || new Date(),
        startTime: initialValues.startTime || '',
        endDate: initialValues.endDate || new Date(),
        endTime: initialValues.endTime || '',
        location: initialValues.location || '',
        attendees: initialValues.attendees || [],
      });
    }
  }, [initialValues]);

  const handleSubmit = async (values: CalendarEventFormData) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error en CreateEventModal:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Crear Nuevo Evento"
      size="md"
      zIndex={1000}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <EventFormFields form={form} />
        
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Crear Evento
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
