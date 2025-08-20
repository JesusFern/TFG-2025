import React from 'react';
import { NumberInput, Select } from '@mantine/core';

type Props = {
  values: {
    nivelActividad: string;
    frecuenciaEjercicio: number | string;
  };
  onChange: (
    field: 'nivelActividad' | 'frecuenciaEjercicio',
    value: string | number | null
  ) => void;
  actividadOptions: { value: string; label: string }[];
};

const ActivityStep: React.FC<Props> = ({ values, onChange, actividadOptions }) => {
  return (
    <>
      <Select label="Nivel de actividad física" data={actividadOptions} value={values.nivelActividad} onChange={(value) => onChange('nivelActividad', value)} required />
      <NumberInput label="Frecuencia de ejercicio semanal" value={values.frecuenciaEjercicio as number} onChange={(value) => onChange('frecuenciaEjercicio', value)} required mt="md" />
    </>
  );
};

export default ActivityStep;


