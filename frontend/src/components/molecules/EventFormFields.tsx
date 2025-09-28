import React from 'react';
import {
  TextInput,
  Textarea,
  Group,
  Stack,
  MultiSelect
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import DatePickerInput from '../atoms/DatePickerInput';

interface EventFormFieldsProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({ form }) => {
  return (
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
        data={form.values.attendees || []}
        searchable
        {...form.getInputProps('attendees')}
      />
    </Stack>
  );
};

export default EventFormFields;
