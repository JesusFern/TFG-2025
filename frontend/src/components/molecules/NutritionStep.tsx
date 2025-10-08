import React, { useState } from 'react';
import { NumberInput, Textarea, Select, TextInput, Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

type Props = {
  values: {
    preferencias: string;
    comidasDia: number | string;
    restricciones: string;
    alergias: string;
    horariosComidas: Array<{ comida: string; hora: string }>;
  };
  onChange: (
    field: 'preferencias' | 'comidasDia' | 'restricciones' | 'alergias' | 'horariosComidas',
    value: string | number | Array<{ comida: string; hora: string }>
  ) => void;
  errors: { [key: string]: string };
};

const NutritionStep: React.FC<Props> = ({ values, errors, onChange }) => {
  const [newComida, setNewComida] = useState('');
  const [newHora, setNewHora] = useState('');

  const tiposComida = [
    'Desayuno',
    'Media mañana',
    'Almuerzo',
    'Merienda',
    'Cena',
    'Snack'
  ];

  const addHorario = () => {
    if (newComida && newHora) {
      let horaFormateada = newHora;
      
      // Solo autocompletar si se escribieron solo números (1-2 dígitos)
      if (/^\d{1,2}$/.test(newHora)) {
        const num = parseInt(newHora);
        if (num >= 0 && num <= 23) {
          horaFormateada = `${newHora.padStart(2, '0')}:00`;
        }
      }
      
      const horarios = [...values.horariosComidas, { comida: newComida, hora: horaFormateada }];
      onChange('horariosComidas', horarios);
      setNewComida('');
      setNewHora('');
    }
  };

  const removeHorario = (index: number) => {
    const horarios = values.horariosComidas.filter((_, i) => i !== index);
    onChange('horariosComidas', horarios);
  };

  const handleHoraChange = (value: string) => {
    setNewHora(value);
  };

  const handleHoraEdit = (index: number, value: string) => {
    const horarios = [...values.horariosComidas];
    horarios[index].hora = value;
    onChange('horariosComidas', horarios);
  };

  // Validar que el número de horarios coincida con comidasDia
  const shouldShowHorariosError = values.comidasDia && 
    values.horariosComidas.length > 0 && 
    values.horariosComidas.length !== Number(values.comidasDia);

  const horariosError = shouldShowHorariosError 
    ? `Debes especificar exactamente ${values.comidasDia} horario(s) de comida` 
    : null;

  const MAX_LENGTH = 200;
  const preferenciasArray = String(values.preferencias).split(',').filter(p => p.trim());
  const restriccionesArray = String(values.restricciones).split(',').filter(r => r.trim());
  const alergiasArray = String(values.alergias).split(',').filter(a => a.trim());
  
  const hasLongPreferencia = preferenciasArray.some(p => p.trim().length > MAX_LENGTH);
  const hasLongRestriccion = restriccionesArray.some(r => r.trim().length > MAX_LENGTH);
  const hasLongAlergia = alergiasArray.some(a => a.trim().length > MAX_LENGTH);
  
  return (
    <>
      <Textarea 
        label="Preferencias alimentarias" 
        value={values.preferencias} 
        onChange={(e) => onChange('preferencias', e.target.value)} 
        placeholder="Separa cada preferencia con comas (ej: Comida casera, Platos mediterráneos)" 
        description={hasLongPreferencia ? "Cada preferencia no puede exceder los 200 caracteres" : "Ingresa tus preferencias alimentarias separadas por comas"}
        error={errors.preferencias || (hasLongPreferencia ? "Una o más preferencias exceden los 200 caracteres" : undefined)} 
      />
      
      <NumberInput 
        label="Número de comidas al día" 
        value={values.comidasDia as number} 
        onChange={(value) => onChange('comidasDia', value)} 
        placeholder="¿Cuántas comidas al día realizas?" 
        min={1} 
        max={10} 
        allowNegative={false} 
        required 
        error={errors.comidasDia} 
        mt="md" 
      />

      <Stack mt="md" pr="md">
        <div>
          <Text size="sm" fw={500}>Horarios de las comidas <span style={{ color: 'red' }}>*</span></Text>
          <Text size="xs" c="dimmed" >Especifica al menos un horario de comida</Text>
        </div>
        
        {values.horariosComidas.map((horario, index) => (
          <Group key={index} gap="xs">
            <Select
              data={tiposComida}
              value={horario.comida}
              onChange={(value) => {
                const horarios = [...values.horariosComidas];
                horarios[index].comida = value || '';
                onChange('horariosComidas', horarios);
              }}
              placeholder="Tipo de comida"
              style={{ flex: 1 }}
            />
            <TextInput
              value={horario.hora}
              onChange={(e) => handleHoraEdit(index, e.target.value)}
              placeholder="HH:MM"
              style={{ width: 100 }}
            />
            <Button
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => removeHorario(index)}
            >
              <IconTrash size={16} />
            </Button>
          </Group>
        ))}

        <Group gap="xs">
          <Select
            data={tiposComida}
            value={newComida}
            onChange={(value) => setNewComida(value || '')}
            placeholder="Tipo de comida"
            style={{ flex: 1 }}
          />
          <TextInput
            value={newHora}
            onChange={(e) => handleHoraChange(e.target.value)}
            placeholder="HH:MM"
            style={{ width: 100 }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addHorario}
            disabled={!newComida || !newHora}
          >
            <IconPlus size={16} />
          </Button>
        </Group>
        
        {errors.horariosComidas && (
          <Text size="xs" c="red">{errors.horariosComidas}</Text>
        )}
        
        {horariosError && (
          <Text size="xs" c="red">{horariosError}</Text>
        )}
      </Stack>

      <Textarea 
        label="Restricciones alimentarias" 
        value={values.restricciones} 
        onChange={(e) => onChange('restricciones', e.target.value)} 
        placeholder="Separa cada restricción con comas (ej: Sin gluten, Sin lactosa)" 
        description={hasLongRestriccion ? "Cada restricción no puede exceder los 200 caracteres" : "Ingresa tus restricciones alimentarias separadas por comas"}
        error={errors.restricciones || (hasLongRestriccion ? "Una o más restricciones exceden los 200 caracteres" : undefined)} 
        mt="md" 
      />
      
      <Textarea 
        label="Intolerancias o alergias alimentarias" 
        value={values.alergias} 
        onChange={(e) => onChange('alergias', e.target.value)} 
        placeholder="Separa cada alergia con comas (ej: Frutos secos, Mariscos)" 
        description={hasLongAlergia ? "Cada alergia no puede exceder los 200 caracteres" : "Ingresa tus alergias o intolerancias separadas por comas"}
        error={errors.alergias || (hasLongAlergia ? "Una o más alergias exceden los 200 caracteres" : undefined)} 
        mt="md" 
      />
    </>
  );
};

export default NutritionStep;


