import React from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Group,
  Stack,
  Button,
  MultiSelect
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import DatePickerInput from '../atoms/DatePickerInput';
import { useForm } from '@mantine/form';
import { CalendarEventFormData } from '../../types/googleCalendar';

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
        <Stack gap="md">
          <TextInput
            label="Título del evento"
            placeholder="Ej: Entrenamiento de fuerza"
            required
            {...form.getInputProps('title')}
          />
          
          <Textarea
            label="Descripción"
            placeholder="Descripción del evento..."
            {...form.getInputProps('description')}
          />

          <Group grow>
            <DatePickerInput
              label="Fecha de inicio"
              required
              zIndex={1000}
              value={form.values.startDate}
              {...form.getInputProps('startDate')}
            />
            <TimeInput
              label="Hora de inicio"
              required
              {...form.getInputProps('startTime')}
            />
          </Group>

          <Group grow>
            <DatePickerInput
              label="Fecha de fin"
              required
              zIndex={1000}
              value={form.values.endDate}
              {...form.getInputProps('endDate')}
            />
            <TimeInput
              label="Hora de fin"
              required    
              {...form.getInputProps('endTime')}
            />
          </Group>

          <TextInput
            label="Ubicación"
            placeholder="Ej: Gimnasio, Casa..."
            {...form.getInputProps('location')}
          />

          <MultiSelect
            label="Asistentes (emails)"
            placeholder="Añadir emails de asistentes"
            data={[]}
            searchable
            {...form.getInputProps('attendees')}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear Evento
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
