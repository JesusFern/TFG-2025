import React, { useState } from 'react';
import { 
  TextInput, 
  Select,  
  Textarea, 
  Button, 
  Group, 
  Stack, 
  useMantineTheme,
  Alert,
  Text
} from '@mantine/core';
import DatePickerInput from '../atoms/DatePickerInput';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { ProfileFormData, ProfileFormErrors } from '../../types/profile';

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const theme = useMantineTheme();
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' }
  ];

  const workerTypeOptions = [
    { value: 'Entrenador personal', label: 'Entrenador personal' },
    { value: 'Nutricionista', label: 'Nutricionista' },
    { value: 'Nutricionista y Entrenador personal', label: 'Nutricionista y Entrenador personal' }
  ];

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es obligatorio';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El número de teléfono no es válido';
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es obligatorio';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    }

    // Validaciones específicas para trabajadores
    if (formData.workerType) {
      if (!formData.biography?.trim()) {
        newErrors.biography = 'La biografía es obligatoria para trabajadores';
      }
      if (!formData.availability?.trim()) {
        newErrors.availability = 'La disponibilidad es obligatoria para trabajadores';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {hasErrors && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Errores de validación" 
            color="red"
            variant="light"
          >
            <Text size="sm">
              Por favor, corrige los errores marcados en el formulario.
            </Text>
          </Alert>
        )}

        {/* Información Personal */}
        <Stack gap="md">
          <Text size="lg" fw={600} c={theme.colors.gray[8]}>
            Información Personal
          </Text>
          
          <Group grow>
            <TextInput
              label="Nombre completo"
              placeholder="Tu nombre completo"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              required
            />
            
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="Número de teléfono"
              placeholder="+34 123 456 789"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              error={errors.phoneNumber}
              required
            />
            
            <Select
              label="Género"
              placeholder="Selecciona tu género"
              data={genderOptions}
              value={formData.gender}
              onChange={(value) => handleInputChange('gender', value)}
              error={errors.gender}
              required
            />
          </Group>

          <DatePickerInput
            label="Fecha de nacimiento"
            value={formData.birthDate || null}
            onChange={(value) => handleInputChange('birthDate', value)}
            error={errors.birthDate}
            required
          />
        </Stack>

        {/* Información de Trabajador (solo si es worker) */}
        {formData.workerType && (
          <Stack gap="md">
            <Text size="lg" fw={600} c={theme.colors.gray[8]}>
              Información Profesional
            </Text>
            
            <Select
              label="Tipo de trabajador"
              placeholder="Selecciona tu especialidad"
              data={workerTypeOptions}
              value={formData.workerType}
              onChange={(value) => handleInputChange('workerType', value)}
              required
            />
            
            <Textarea
              label="Biografía"
              placeholder="Cuéntanos sobre tu experiencia y formación..."
              value={formData.biography || ''}
              onChange={(e) => handleInputChange('biography', e.target.value)}
              error={errors.biography}
              required
              minRows={3}
              maxRows={6}
            />
            
            <TextInput
              label="Disponibilidad"
              placeholder="Ej: Lunes a Viernes 9:00-18:00"
              value={formData.availability || ''}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              error={errors.availability}
              required
            />
          </Stack>
        )}

        {/* Botones de acción */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="light"
            color="gray"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            color="nutroos-green"
            loading={isLoading}
            leftSection={!isLoading && <IconCheck size={16} />}
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
