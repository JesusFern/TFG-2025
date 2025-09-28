import React from 'react';
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
      startDate: (value) => (!value ? 'La fecha de inicio es requerida' : null),
      startTime: (value) => (value.length < 1 ? 'La hora de inicio es requerida' : null),
      endDate: (value) => (!value ? 'La fecha de fin es requerida' : null),
      endTime: (value) => (value.length < 1 ? 'La hora de fin es requerida' : null),
    }
  });

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
