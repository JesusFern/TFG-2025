import React from 'react';
import { Textarea } from '@mantine/core';

type Props = {
  values: {
    restricciones: string;
    alergias: string;
  };
  onChange: (field: 'restricciones' | 'alergias', value: string) => void;
};

const RestrictionsStep: React.FC<Props> = ({ values, onChange }) => {
  return (
    <>
      <Textarea label="Restricciones alimentarias" value={values.restricciones} onChange={(e) => onChange('restricciones', e.target.value)} />
      <Textarea label="Intolerancias o alergias alimentarias" value={values.alergias} onChange={(e) => onChange('alergias', e.target.value)} mt="md" />
    </>
  );
};

export default RestrictionsStep;


