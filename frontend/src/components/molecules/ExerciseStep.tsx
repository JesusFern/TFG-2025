import React from 'react';
import { MultiSelect, Select, TextInput } from '@mantine/core';
import { IconBallAmericanFootball, IconBike, IconCalendarEvent, IconTarget } from '@tabler/icons-react';

type Props = {
  values: {
    tipoEjercicio: string[];
    otrosEjercicios: string;
    disponibilidad: string;
    objetivo: string;
  };
  errors: { [key: string]: string };
  onChange: (
    field: 'tipoEjercicio' | 'otrosEjercicios' | 'disponibilidad' | 'objetivo',
    value: string | string[] | null
  ) => void;
  ejercicioOptions: { value: string; label: string }[];
  objetivoOptions: { value: string; label: string }[];
};

const ExerciseStep: React.FC<Props> = ({ values, errors, onChange, ejercicioOptions, objetivoOptions }) => {
  const MAX_OTROS_LENGTH = 200;
  const MAX_DISPONIBILIDAD_LENGTH = 500;
  
  const otrosLength = String(values.otrosEjercicios).length;
  const disponibilidadLength = String(values.disponibilidad).length;
  
  const otrosError = otrosLength > MAX_OTROS_LENGTH ? `Máximo ${MAX_OTROS_LENGTH} caracteres (actualmente ${otrosLength})` : errors.otrosEjercicios;
  const disponibilidadError = disponibilidadLength > MAX_DISPONIBILIDAD_LENGTH ? `Máximo ${MAX_DISPONIBILIDAD_LENGTH} caracteres (actualmente ${disponibilidadLength})` : errors.disponibilidad;
  
  return (
    <>
      <MultiSelect label="Tipo de ejercicio habitual" placeholder="Selecciona los tipos de ejercicio que realizas" leftSectionPointerEvents="none" leftSection={<IconBike size={16} />} data={ejercicioOptions} value={values.tipoEjercicio} onChange={(value) => onChange('tipoEjercicio', value)} required error={errors.tipoEjercicio}  />
      <TextInput 
        label="Otros ejercicios" 
        placeholder="¿Qué otros ejercicios realizas?" 
        description={`${otrosLength} / ${MAX_OTROS_LENGTH} caracteres`}
        leftSectionPointerEvents="none" 
        leftSection={<IconBallAmericanFootball size={16} />} 
        value={values.otrosEjercicios} 
        onChange={(e) => onChange('otrosEjercicios', e.target.value)} 
        error={otrosError} 
        mt="md" 
      />
      <TextInput 
        label="Disponibilidad para entrenar" 
        placeholder="Ej: Lunes a Viernes 18:00-20:00, fines de semana por la mañana" 
        description={`${disponibilidadLength} / ${MAX_DISPONIBILIDAD_LENGTH} caracteres`}
        leftSectionPointerEvents="none" 
        leftSection={<IconCalendarEvent size={16} />} 
        value={values.disponibilidad} 
        onChange={(e) => onChange('disponibilidad', e.target.value)} 
        required 
        error={disponibilidadError} 
        mt="md" 
      />
      <Select label="Objetivo principal" placeholder="Selecciona un objetivo" leftSectionPointerEvents="none" leftSection={<IconTarget size={16} />} data={objetivoOptions} value={values.objetivo} onChange={(value) => onChange('objetivo', value)} required error={errors.objetivo} mt="md" />
    </>
  );
};

export default ExerciseStep;


