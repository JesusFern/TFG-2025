import React from 'react';
import { PasswordInput, Select, TextInput } from '@mantine/core';
import DatePickerInput from '../atoms/DatePickerInput';
import TwoColumn from './TwoColumn';
import { IconAt, IconPhone, IconLock, IconCalendar } from '@tabler/icons-react';

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
  const iconEmail = <IconAt size={16} />;
  const iconPhone = <IconPhone size={16} />;
  const iconLock = <IconLock size={16} />;
  const iconCalendar = <IconCalendar size={16} />;

  return (
    <TwoColumn
      left={
        <>
          <TextInput label="Nombre y apellidos" placeholder="Nombre y apellidos" value={values.nombre} onChange={(e) => onChange('nombre', e.target.value)} required error={errors.nombre} />
          <TextInput label="Correo electrónico" leftSectionPointerEvents="none" leftSection={iconEmail} placeholder="usuario@correo.com" value={values.email} onChange={(e) => onChange('email', e.target.value)} required error={errors.email} />
          <TextInput label="Número de teléfono" leftSectionPointerEvents="none" leftSection={iconPhone} placeholder="+34123456789" value={values.telefono} onChange={(e) => onChange('telefono', e.target.value)} required error={errors.telefono} />
        </>
      }
      right={
        <>
          <DatePickerInput label="Fecha de nacimiento" leftSectionPointerEvents="none" leftSection={iconCalendar} value={values.fechaNacimiento} onChange={(date) => onChange('fechaNacimiento', date ? date.toISOString() : null)} error={errors.fechaNacimiento} required />
          <PasswordInput label="Contraseña" leftSectionPointerEvents="none" leftSection={iconLock} placeholder="Contraseña" value={values.password} onChange={(e) => onChange('password', e.target.value)} required error={errors.password} />
          <Select label="Género" data={generoOptions} placeholder="Selecciona un género" value={values.genero} onChange={(value) => onChange('genero', value)} required error={errors.genero} />
        </>
      }
    />
  );
};

export default PersonalInfoStep;


