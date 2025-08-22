import React from 'react';
import { NumberInput, Select } from '@mantine/core';
import { IconHeartHandshake, IconClock } from '@tabler/icons-react';

type Props = {
  values: {
    nivelActividad: string;
    frecuenciaEjercicio: number | string;
  };
  errors: { [key: string]: string };
  onChange: (
    field: 'nivelActividad' | 'frecuenciaEjercicio',
    value: string | number | null
  ) => void;
  actividadOptions: { value: string; label: string }[];
};

const ActivityStep: React.FC<Props> = ({ values, errors, onChange, actividadOptions }) => {
  return (
    <>
      <Select label="Nivel de actividad física" placeholder="Selecciona tu nivel de actividad física" leftSectionPointerEvents="none" leftSection={<IconHeartHandshake size={16} />} data={actividadOptions} value={values.nivelActividad} onChange={(value) => onChange('nivelActividad', value)} required error={errors.nivelActividad} />
      <NumberInput label="Frecuencia de ejercicio semanal" placeholder="¿Cuántos días a la semana realizas ejercicio?" leftSectionPointerEvents="none" leftSection={<IconClock size={16} />} value={values.frecuenciaEjercicio as number} onChange={(value) => onChange('frecuenciaEjercicio', value)} min={0} allowNegative={false} required error={errors.frecuenciaEjercicio} mt="md" />
    </>
  );
};

export default ActivityStep;


