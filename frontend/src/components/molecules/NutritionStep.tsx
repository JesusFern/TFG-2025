import React from 'react';
import { NumberInput, Textarea } from '@mantine/core';

type Props = {
  values: {
    preferencias: string;
    comidasDia: number | string;
    restricciones: string;
    alergias: string;
  };
  onChange: (
    field: 'preferencias' | 'comidasDia' | 'restricciones' | 'alergias',
    value: string | number
  ) => void;
  errors: { [key: string]: string };
};

const NutritionStep: React.FC<Props> = ({ values, errors, onChange }) => {
  return (
    <>
      <Textarea label="Preferencias alimentarias" value={values.preferencias} onChange={(e) => onChange('preferencias', e.target.value)} required error={errors.preferencias} />
      <NumberInput label="Número de comidas al día" value={values.comidasDia as number} onChange={(value) => onChange('comidasDia', value)} required error={errors.comidasDia} mt="md" />
      <Textarea label="Restricciones alimentarias" value={values.restricciones} onChange={(e) => onChange('restricciones', e.target.value)} error={errors.restricciones} />
      <Textarea label="Intolerancias o alergias alimentarias" value={values.alergias} onChange={(e) => onChange('alergias', e.target.value)} error={errors.alergias} mt="md" />
    </>
  );
};

export default NutritionStep;


