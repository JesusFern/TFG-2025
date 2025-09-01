import React from 'react';
import { NumberInput, Textarea } from '@mantine/core';
import { IconRuler, IconWeight } from '@tabler/icons-react';

type Props = {
  values: {
    altura: string | number;
    peso: string | number;
    objetivoPeso: string | number;
    condiciones: string;
  };
  errors: { [key: string]: string };
  onChange: (
    field: 'altura' | 'peso' | 'objetivoPeso' | 'condiciones',
    value: string | number
  ) => void;
};

const PhysicalDataStep: React.FC<Props> = ({ values, errors, onChange }) => {
  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <NumberInput label="Altura (cm)" placeholder="¿Cuál es tu altura?" leftSectionPointerEvents="none" leftSection={<IconRuler size={16} />} value={values.altura} onChange={(value) => onChange('altura', value)} required error={errors.altura} style={{ flex: 1 }} />
        <NumberInput label="Peso actual (kg)" placeholder="¿Cuál es tu peso actual?" leftSectionPointerEvents="none" leftSection={<IconWeight size={16} />} value={values.peso} onChange={(value) => onChange('peso', value)} required error={errors.peso} style={{ flex: 1 }} />
      </div>
      <NumberInput label="Objetivo de peso (kg)" placeholder="¿Cuál es tu peso objetivo?" leftSectionPointerEvents="none" leftSection={<IconWeight size={16} />} value={values.objetivoPeso as number} onChange={(value) => onChange('objetivoPeso', value)} required error={errors.objetivoPeso} mt="md" />
      <Textarea label="Condiciones médicas" placeholder="¿Tienes alguna condición médica?" value={values.condiciones} onChange={(e) => onChange('condiciones', e.target.value)} error={errors.condiciones} mt="md" />
    </>
  );
};

export default PhysicalDataStep;


