import React from 'react';
import { PasswordInput, Select, TextInput } from '@mantine/core';
import DatePickerInput from '../atoms/DatePickerInput';
import TwoColumn from './TwoColumn';

type Props = {
  values: {
    nombre: string;
    email: string;
    telefono: string;
    fechaNacimiento: Date | null;
    password: string;
    genero: string;
  };
  errors: { [key: string]: string };
  onChange: (
    field:
      | 'nombre'
      | 'email'
      | 'telefono'
      | 'fechaNacimiento'
      | 'password'
      | 'genero',
    value: string | null
  ) => void;
  generoOptions: { value: string; label: string }[];
};

const PersonalInfoStep: React.FC<Props> = ({ values, errors, onChange, generoOptions }) => {
  return (
    <TwoColumn
      left={
        <>
          <TextInput label="Nombre y apellidos" value={values.nombre} onChange={(e) => onChange('nombre', e.target.value)} required size="md" error={errors.nombre} />
          <TextInput label="Correo electrónico" value={values.email} onChange={(e) => onChange('email', e.target.value)} required size="md" error={errors.email} />
          <TextInput label="Número de teléfono" placeholder="+34123456789" value={values.telefono} onChange={(e) => onChange('telefono', e.target.value)} required size="md" error={errors.telefono} />
        </>
      }
      right={
        <>
          <DatePickerInput label="Fecha de nacimiento" value={values.fechaNacimiento} onChange={(date) => onChange('fechaNacimiento', date ? date.toISOString() : null)} error={errors.fechaNacimiento} required />
          <PasswordInput label="Contraseña" value={values.password} onChange={(e) => onChange('password', e.target.value)} required size="md" error={errors.password} />
          <Select label="Género" data={generoOptions} value={values.genero} onChange={(value) => onChange('genero', value)} required size="md" error={errors.genero} />
        </>
      }
    />
  );
};

export default PersonalInfoStep;


