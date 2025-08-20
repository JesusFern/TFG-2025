import React from 'react';
import { NumberInput, TextInput, Textarea } from '@mantine/core';

type Props = {
  values: {
    altura: string | number;
    peso: string | number;
    objetivoPeso: string | number;
    condiciones: string;
  };
  onChange: (
    field: 'altura' | 'peso' | 'objetivoPeso' | 'condiciones',
    value: string | number
  ) => void;
};

const PhysicalDataStep: React.FC<Props> = ({ values, onChange }) => {
  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <TextInput label="Altura (cm)" value={values.altura} onChange={(e) => onChange('altura', e.target.value)} style={{ flex: 1 }} />
        <TextInput label="Peso actual (kg)" value={values.peso} onChange={(e) => onChange('peso', e.target.value)} style={{ flex: 1 }} />
      </div>
      <NumberInput label="Objetivo de peso (kg)" value={values.objetivoPeso as number} onChange={(value) => onChange('objetivoPeso', value)} required mt="md" />
      <Textarea label="Condiciones médicas" value={values.condiciones} onChange={(e) => onChange('condiciones', e.target.value)} mt="md" />
    </>
  );
};

export default PhysicalDataStep;


