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
import { IconTrash } from '@tabler/icons-react';
import { CalendarEventFormData, GoogleCalendarEvent } from '../../types/googleCalendar';

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
      startDate: (value) => (!value ? 'La fecha de inicio es requerida' : null),
      startTime: (value) => (value.length < 1 ? 'La hora de inicio es requerida' : null),
      endDate: (value) => (!value ? 'La fecha de fin es requerida' : null),
      endTime: (value) => (value.length < 1 ? 'La hora de fin es requerida' : null),
    }
  });

  // Actualizar formulario cuando cambie el evento
  React.useEffect(() => {
    if (event) {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      form.setValues({
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
  }, [event]); // Remover 'form' de las dependencias

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
              value={form.values.endDate}
              zIndex={1000}
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

          <Group justify="space-between">
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
        </Stack>
      </form>
    </Modal>
  );
};

export default EditEventModal;
