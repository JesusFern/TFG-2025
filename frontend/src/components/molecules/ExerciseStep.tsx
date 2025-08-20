import React from 'react';
import { MultiSelect, Select, TextInput } from '@mantine/core';

type Props = {
  values: {
    tipoEjercicio: string[];
    otrosEjercicios: string;
    disponibilidad: string;
    objetivo: string;
  };
  onChange: (
    field: 'tipoEjercicio' | 'otrosEjercicios' | 'disponibilidad' | 'objetivo',
    value: string | string[] | null
  ) => void;
  ejercicioOptions: { value: string; label: string }[];
  objetivoOptions: { value: string; label: string }[];
};

const ExerciseStep: React.FC<Props> = ({ values, onChange, ejercicioOptions, objetivoOptions }) => {
  return (
    <>
      <MultiSelect label="Tipo de ejercicio habitual" data={ejercicioOptions} value={values.tipoEjercicio} onChange={(value) => onChange('tipoEjercicio', value)} required />
      <TextInput label="Otros ejercicios" value={values.otrosEjercicios} onChange={(e) => onChange('otrosEjercicios', e.target.value)} mt="md" />
      <TextInput label="Disponibilidad para entrenar" value={values.disponibilidad} onChange={(e) => onChange('disponibilidad', e.target.value)} mt="md" />
      <Select label="Objetivo principal" data={objetivoOptions} value={values.objetivo} onChange={(value) => onChange('objetivo', value)} required mt="md" />
    </>
  );
};

export default ExerciseStep;


