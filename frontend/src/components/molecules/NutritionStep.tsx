import React from 'react';
import { NumberInput, Textarea } from '@mantine/core';

type Props = {
  values: {
    preferencias: string;
    comidasDia: number | string;
  };
  onChange: (
    field: 'preferencias' | 'comidasDia',
    value: string | number
  ) => void;
};

const NutritionStep: React.FC<Props> = ({ values, onChange }) => {
  return (
    <>
      <Textarea label="Preferencias alimentarias" value={values.preferencias} onChange={(e) => onChange('preferencias', e.target.value)} />
      <NumberInput label="Número de comidas al día" value={values.comidasDia as number} onChange={(value) => onChange('comidasDia', value)} required mt="md" />
    </>
  );
};

export default NutritionStep;


