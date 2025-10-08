import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  TextInput,
  PasswordInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Title,
  LoadingOverlay,
  Box,
  Text,
  FileInput,
  Grid
} from '@mantine/core';
import { IconCheck, IconX, IconUser, IconMail, IconPhone, IconCalendar, IconBriefcase, IconFileText, IconClock, IconCamera } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { registerWorker, WorkerRegistrationData } from '../../services/userService';

interface WorkerFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  workerType: string;
  biography: string;
  availability: string;
  profilePicture: File | null;
}

const workerTypeOptions = [
  { value: 'Entrenador personal', label: 'Entrenador Personal' },
  { value: 'Nutricionista', label: 'Nutricionista' },
  { value: 'Nutricionista y Entrenador personal', label: 'Nutricionista y Entrenador Personal' },
];

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
];

const RegisterWorkerForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureBase64, setProfilePictureBase64] = useState<string | null>(null);

  const form = useForm<WorkerFormData>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      birthDate: '',
      gender: '',
      workerType: '',
      biography: '',
      availability: '',
      profilePicture: null,
    },
    validate: {
      fullName: (value) => {
        if (!value) return 'El nombre completo es obligatorio';
        if (value.length < 2) return 'El nombre completo debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El nombre completo no puede exceder los 100 caracteres';
        return null;
      },
      email: (value) => (!value ? 'El email es obligatorio' : /^\S+@\S+$/.test(value) ? null : 'Email no válido'),
      password: (value) => (!value ? 'La contraseña es obligatoria' : null),
      confirmPassword: (value, values) => 
        value !== values.password ? 'Las contraseñas no coinciden' : null,
      phoneNumber: (value) => (!value ? 'El número de teléfono es obligatorio' : null),
      birthDate: (value) => {
        if (!value) return 'La fecha de nacimiento es obligatoria';
        
        // Validar formato dd/mm/yyyy
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = value.match(dateRegex);
        
        if (!match) {
          return 'La fecha debe estar en formato dd/mm/yyyy';
        }
        
        const [, day, month, year] = match;
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        // Validar rangos
        if (dayNum < 1 || dayNum > 31) return 'El día debe estar entre 01 y 31';
        if (monthNum < 1 || monthNum > 12) return 'El mes debe estar entre 01 y 12';
        if (yearNum < 1900 || yearNum > new Date().getFullYear()) return 'El año no es válido';
        
        // Crear fecha y validar que sea válida
        const birthDate = new Date(yearNum, monthNum - 1, dayNum);
        if (birthDate.getDate() !== dayNum || birthDate.getMonth() !== monthNum - 1 || birthDate.getFullYear() !== yearNum) {
          return 'La fecha no es válida';
        }
        
        // Validar edad
        const today = new Date();
        let age = today.getFullYear() - yearNum;
        const monthDiff = today.getMonth() - (monthNum - 1);
        const dayDiff = today.getDate() - dayNum;
        
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        
        if (age < 18 || age > 65) return 'El trabajador debe tener entre 18 y 65 años';
        if (birthDate > today) return 'La fecha de nacimiento no puede ser futura';
        
        return null;
      },
      gender: (value) => (!value ? 'El género es obligatorio' : null),
      workerType: (value) => (!value ? 'El tipo de trabajador es obligatorio' : null),
      biography: (value) => {
        if (!value) return 'La biografía es obligatoria';
        if (value.length > 1000) return 'La biografía no puede exceder los 1000 caracteres';
        return null;
      },
      availability: (value) => {
        if (!value) return 'La disponibilidad es obligatoria';
        if (value.length > 500) return 'La disponibilidad no puede exceder los 500 caracteres';
        return null;
      },
    },
  });

  const handleFileChange = (file: File | null) => {
    form.setFieldValue('profilePicture', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePictureBase64(result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePictureBase64(null);
    }
  };

  // Función para formatear la fecha automáticamente
  const formatDateInput = (value: string) => {
    // Remover caracteres que no sean números
    const numbersOnly = value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    const limitedNumbers = numbersOnly.slice(0, 8);
    
    // Formatear con barras
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
    } else {
      return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2, 4)}/${limitedNumbers.slice(4)}`;
    }
  };

  const handleDateChange = (value: string) => {
    const formattedValue = formatDateInput(value);
    form.setFieldValue('birthDate', formattedValue);
  };

  const handleSubmit = async (values: WorkerFormData) => {
    setIsSubmitting(true);

    try {
      // Convertir fecha de dd/mm/yyyy a yyyy-mm-dd
      const convertDateToISO = (dateString: string): string => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const payload: WorkerRegistrationData = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        birthDate: convertDateToISO(values.birthDate), // Convertir a formato YYYY-MM-DD
        gender: values.gender as 'Masculino' | 'Femenino' | 'Otro',
        workerType: values.workerType as 'Entrenador personal' | 'Nutricionista' | 'Nutricionista y Entrenador personal',
        biography: values.biography,
        availability: values.availability,
        profilePicture: profilePictureBase64 || undefined,
      };

      const response = await registerWorker(payload);

      notifications.show({
        title: 'Trabajador Registrado',
        message: response.message || 'El trabajador ha sido registrado exitosamente',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate(-1);
      }, 1500);

    } catch (error) {
      console.error('Error al registrar trabajador:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al registrar el trabajador',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay 
        visible={isSubmitting} 
        zIndex={1000} 
        overlayProps={{ radius: "sm", blur: 2 }} 
      />
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Información Personal */}
          <Paper p="md" withBorder>
            <Title order={4} mb="md" c="nutroos-green.7">
              <IconUser size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Información Personal
            </Title>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs">
                  <TextInput
                    label="Nombre Completo"
                    placeholder="Ej: María García López"
                    required
                    leftSection={<IconUser size={16} />}
                    {...form.getInputProps('fullName')}
                  />
                  <Group justify="flex-end">
                    <Text 
                      size="xs" 
                      c={(form.values.fullName?.length || 0) > 100 ? 'red' : (form.values.fullName?.length || 0) > 90 ? 'orange' : 'dimmed'}
                    >
                      {form.values.fullName?.length || 0} / 100 caracteres
                    </Text>
                  </Group>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Email"
                  placeholder="Ej: maria.garcia@nutroos.com"
                  type="email"
                  required
                  leftSection={<IconMail size={16} />}
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <PasswordInput
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  required
                  {...form.getInputProps('password')}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <PasswordInput
                  label="Confirmar Contraseña"
                  placeholder="Repite la contraseña"
                  required
                  {...form.getInputProps('confirmPassword')}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Teléfono"
                  placeholder="Ej: +34612345678"
                  required
                  leftSection={<IconPhone size={16} />}
                  {...form.getInputProps('phoneNumber')}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Fecha de Nacimiento"
                  placeholder="dd/mm/yyyy"
                  required
                  leftSection={<IconCalendar size={16} />}
                  value={form.values.birthDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  error={form.errors.birthDate}
                  description="Formato: dd/mm/yyyy (ej: 15/05/1990)"
                  maxLength={10}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Género"
                  placeholder="Selecciona el género"
                  required
                  data={genderOptions}
                  {...form.getInputProps('gender')}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Información Profesional */}
          <Paper p="md" withBorder>
            <Title order={4} mb="md" c="nutroos-green.7">
              <IconBriefcase size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Información Profesional
            </Title>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Tipo de Trabajador"
                  placeholder="Selecciona el tipo"
                  required
                  data={workerTypeOptions}
                  leftSection={<IconBriefcase size={16} />}
                  {...form.getInputProps('workerType')}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Stack gap="xs">
                  <Textarea
                    label="Biografía"
                    placeholder="Describe tu experiencia profesional, especialidades, certificaciones, etc."
                    required
                    minRows={3}
                    maxRows={6}
                    leftSection={<IconFileText size={16} />}
                    {...form.getInputProps('biography')}
                  />
                  <Group justify="flex-end">
                    <Text 
                      size="xs" 
                      c={(form.values.biography?.length || 0) > 1000 ? 'red' : (form.values.biography?.length || 0) > 900 ? 'orange' : 'dimmed'}
                    >
                      {form.values.biography?.length || 0} / 1000 caracteres
                    </Text>
                  </Group>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Stack gap="xs">
                  <Textarea
                    label="Disponibilidad"
                    placeholder="Describe tu horario de trabajo, días disponibles, modalidad (presencial/online), etc."
                    required
                    minRows={2}
                    maxRows={4}
                    leftSection={<IconClock size={16} />}
                    {...form.getInputProps('availability')}
                  />
                  <Group justify="flex-end">
                    <Text 
                      size="xs" 
                      c={(form.values.availability?.length || 0) > 500 ? 'red' : (form.values.availability?.length || 0) > 450 ? 'orange' : 'dimmed'}
                    >
                      {form.values.availability?.length || 0} / 500 caracteres
                    </Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Foto de Perfil */}
          <Paper p="md" withBorder>
            <Title order={4} mb="md" c="nutroos-green.7">
              <IconCamera size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Foto de Perfil (Opcional)
            </Title>
            
            <FileInput
              label="Imagen de Perfil"
              placeholder="Selecciona una imagen"
              accept="image/*"
              leftSection={<IconCamera size={16} />}
              onChange={handleFileChange}
              description="Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 10MB"
            />
            
            {profilePictureBase64 && (
              <Box mt="md">
                <Text size="sm" c="green" fw={500}>
                  ✓ Imagen seleccionada correctamente
                </Text>
                <Box
                  component="img"
                  src={profilePictureBase64}
                  alt="Vista previa"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginTop: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
            )}
          </Paper>

          {/* Botones */}
          <Group justify="flex-end" mt="xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              color="nutroos-green"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              leftSection={<IconCheck size={16} />}
              color="nutroos-green"
            >
              Registrar Trabajador
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

export default RegisterWorkerForm;
