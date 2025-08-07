import React, { useState } from 'react';
import { 
  TextInput, 
  Textarea, 
  NumberInput, 
  Select, 
  Button, 
  Group, 
  SimpleGrid, 
  Checkbox, 
  Divider,
  CheckboxGroup
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { crearDieta } from '../../services/dietService';
import { CrearDietaDTO, DietaResponse } from '../../types';

interface FormularioCrearDietaProps {
  onSuccess: (dietaData: DietaResponse) => void;
  onError: (error: Error) => void;
}

const FormularioCrearDieta: React.FC<FormularioCrearDietaProps> = ({ onSuccess, onError }) => {
  const tiposDieta = [
    'Mediterránea',
    'Vegetariana',
    'Vegana',
    'Keto',
    'Paleo',
    'Sin gluten',
    'Baja en carbohidratos',
    'Alta en proteínas'
  ];

  const [formData, setFormData] = useState<CrearDietaDTO>({
    nombre: '',
    descripcion: '',
    tipo: [],
    duracion: 7,
    comidasDiarias: 3,
    fechaInicio: new Date().toISOString().split('T')[0], // Fecha actual en formato yyyy-mm-dd
    asignadaA: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CrearDietaDTO, value: string | number | string[] | Date) => {
    if (field === 'fechaInicio' && value instanceof Date) {
      // Convertir Date a string formato YYYY-MM-DD
      setFormData(prev => ({
        ...prev,
        [field]: value.toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTipoChange = (value: string[]) => {
    setFormData(prev => ({
      ...prev,
      tipo: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre) {
      onError(new Error('El nombre de la dieta es obligatorio'));
      return;
    }
    
    if (formData.tipo.length === 0) {
      onError(new Error('Debes seleccionar al menos un tipo de dieta'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convertir la fecha al formato que espera el backend (DD-MM-YYYY)
      const fechaArr = formData.fechaInicio.split('-'); // [yyyy, mm, dd]
      const fechaFormateada = `${fechaArr[2]}-${fechaArr[1]}-${fechaArr[0]}`;
      
      const response = await crearDieta({
        ...formData,
        fechaInicio: fechaFormateada
      });
      
      onSuccess(response.dieta);
      
      // Restablecer el formulario
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: [],
        duracion: 7,
        comidasDiarias: 3,
        fechaInicio: new Date().toISOString().split('T')[0],
        asignadaA: ''
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Convertir la fecha de string a Date para el DatePicker
  const fechaInicioDate = formData.fechaInicio ? new Date(formData.fechaInicio) : new Date();

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Nombre de la dieta"
        placeholder="Ej: Dieta mediterránea equilibrada"
        required
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        mb="md"
      />
      
      <Textarea
        label="Descripción"
        placeholder="Describe brevemente esta dieta"
        minRows={3}
        value={formData.descripcion || ''}
        onChange={(e) => handleInputChange('descripcion', e.target.value)}
        mb="md"
      />
      
      <Divider my="md" label="Tipo de dieta" labelPosition="center" />
      
      <CheckboxGroup
        value={formData.tipo}
        onChange={handleTipoChange}
        required
        mb="md"
      >
        <SimpleGrid cols={2} spacing="xs">
          {tiposDieta.map((tipo) => (
            <Checkbox key={tipo} value={tipo} label={tipo} />
          ))}
        </SimpleGrid>
      </CheckboxGroup>
      
      {/* Cambio de breakpoints a GridCol */}
      <SimpleGrid cols={{base: 1, sm: 2}} mt="md">
        <NumberInput
          label="Duración (días)"
          min={1}
          step={1}
          required
          value={formData.duracion}
          onChange={(val) => handleInputChange('duracion', val || 7)}
        />
        
        <Select
          label="Comidas diarias"
          data={[
            { value: '2', label: '2 comidas' },
            { value: '3', label: '3 comidas' },
            { value: '4', label: '4 comidas' },
            { value: '5', label: '5 comidas' },
            { value: '6', label: '6 comidas' }
          ]}
          value={formData.comidasDiarias.toString()}
          onChange={(val) => handleInputChange('comidasDiarias', parseInt(val || '3'))}
          required
        />
        
        <DatePickerInput
          label="Fecha de inicio"
          placeholder="Selecciona una fecha"
          leftSection={<IconCalendar size={16} />}
          value={fechaInicioDate}
          onChange={(date) => date && handleInputChange('fechaInicio', date)}
          required
          clearable={false}
        />
        
        <TextInput
          label="Asignar a cliente (ID)"
          placeholder="ID del cliente (opcional)"
          value={formData.asignadaA || ''}
          onChange={(e) => handleInputChange('asignadaA', e.target.value)}
        />
      </SimpleGrid>
      
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting} 
          leftSection={isSubmitting ? undefined : <IconCheck size={16} />}
        >
          {isSubmitting ? 'Creando...' : 'Crear Dieta'}
        </Button>
      </Group>
    </form>
  );
};

export default FormularioCrearDieta;