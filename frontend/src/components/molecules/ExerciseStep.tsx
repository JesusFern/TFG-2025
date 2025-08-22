import React from 'react';
import { MultiSelect, Select, TextInput } from '@mantine/core';
import { IconBallAmericanFootball, IconBike, IconCalendarEvent, IconTarget } from '@tabler/icons-react';

type Props = {
  values: {
    tipoEjercicio: string[];
    otrosEjercicios: string;
    disponibilidad: string;
    objetivo: string;
  };
  errors: { [key: string]: string };
  onChange: (
    field: 'tipoEjercicio' | 'otrosEjercicios' | 'disponibilidad' | 'objetivo',
    value: string | string[] | null
  ) => void;
  ejercicioOptions: { value: string; label: string }[];
  objetivoOptions: { value: string; label: string }[];
};

const ExerciseStep: React.FC<Props> = ({ values, errors, onChange, ejercicioOptions, objetivoOptions }) => {
  return (
    <>
      <MultiSelect label="Tipo de ejercicio habitual" placeholder="Selecciona los tipos de ejercicio que realizas" leftSectionPointerEvents="none" leftSection={<IconBike size={16} />} data={ejercicioOptions} value={values.tipoEjercicio} onChange={(value) => onChange('tipoEjercicio', value)} required error={errors.tipoEjercicio}  />
      <TextInput label="Otros ejercicios" placeholder="¿Qué otros ejercicios realizas?" leftSectionPointerEvents="none" leftSection={<IconBallAmericanFootball size={16} />} value={values.otrosEjercicios} onChange={(e) => onChange('otrosEjercicios', e.target.value)} error={errors.otrosEjercicios} mt="md" />
      <TextInput label="Disponibilidad para entrenar" placeholder="¿Cuál es tu disponibilidad para entrenar?" leftSectionPointerEvents="none" leftSection={<IconCalendarEvent size={16} />} value={values.disponibilidad} onChange={(e) => onChange('disponibilidad', e.target.value)} required error={errors.disponibilidad} mt="md" />
      <Select label="Objetivo principal" placeholder="Selecciona un objetivo" leftSectionPointerEvents="none" leftSection={<IconTarget size={16} />} data={objetivoOptions} value={values.objetivo} onChange={(value) => onChange('objetivo', value)} required error={errors.objetivo} mt="md" />
    </>
  );
};

export default ExerciseStep;


